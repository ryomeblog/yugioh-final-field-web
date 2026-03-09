import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiDownload, FiUpload, FiPlus, FiSettings } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { ComboCard } from "@/components/combo/ComboCard";
import { ImportModal } from "@/components/common/ImportModal";
import { DownloadModal } from "@/components/home/DownloadModal";
import { SettingsModal } from "@/components/home/SettingsModal";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { useCombo } from "@/hooks/useCombo";
import { useImageCache } from "@/hooks/useImageCache";
import { useZip } from "@/hooks/useZip";
import { useTutorial } from "@/hooks/useTutorial";

export function HomePage() {
  const navigate = useNavigate();
  const { state, mergeCombos } = useCombo();
  const { getImageUrl, addImageFromBlob } = useImageCache();
  const { exportCombos, importZip } = useZip();
  const [showImport, setShowImport] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const tutorial = useTutorial("home");

  async function handleImport(file: File) {
    const { combos, images } = await importZip(file);
    for (const img of images) {
      await addImageFromBlob(img.id, img.fileName, img.blob);
    }
    await mergeCombos(combos);
  }

  async function handleDownload(comboIds: string[]) {
    const selected = state.combos.filter((c) => comboIds.includes(c.id));
    await exportCombos(selected, "combo-collection.zip");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <Header
        title="展開一覧"
        actions={
          <>
            <button
              onClick={() => setShowImport(true)}
              className="rounded-md bg-blue-900 p-2 text-gray-200 hover:bg-blue-800"
            >
              <FiUpload size={16} />
            </button>
            <button
              onClick={() => setShowDownload(true)}
              className="rounded-md bg-blue-900 p-2 text-gray-200 hover:bg-blue-800"
            >
              <FiDownload size={16} />
            </button>
            <button
              onClick={() => navigate("/combo/new")}
              className="rounded-md bg-blue-900 px-3 py-2 text-sm text-gray-200 hover:bg-blue-800"
            >
              <FiPlus size={16} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-md bg-gray-700 p-2 text-gray-300 hover:bg-gray-600"
            >
              <FiSettings size={16} />
            </button>
          </>
        }
      />

      <main className="flex-1 p-4">
        {state.isLoading ? (
          <p className="py-8 text-center text-gray-500">読み込み中...</p>
        ) : state.combos.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            展開がありません。+ボタンで作成してください。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {state.combos.map((combo) => (
              <ComboCard
                key={combo.id}
                combo={combo}
                onClick={() => navigate(`/combo/${combo.id}`)}
                getImageUrl={getImageUrl}
              />
            ))}
          </div>
        )}
      </main>

      <ImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
      <DownloadModal
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
        combos={state.combos}
        onDownload={handleDownload}
        getImageUrl={getImageUrl}
      />
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {tutorial.isActive && tutorial.currentStep && (
        <TutorialOverlay
          step={tutorial.currentStep}
          currentIndex={tutorial.currentStepIndex}
          totalSteps={tutorial.totalSteps}
          onNext={tutorial.next}
          onBack={tutorial.back}
          onSkip={tutorial.skip}
        />
      )}
    </div>
  );
}
