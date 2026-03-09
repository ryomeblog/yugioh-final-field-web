import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiDownload,
  FiTrash2,
  FiShare2,
} from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { StartingCards } from "@/components/combo/StartingCards";
import { StepCardReadonly } from "@/components/combo/StepCardReadonly";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { ShareModal } from "@/components/common/ShareModal";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { useCombo } from "@/hooks/useCombo";
import { useImageCache } from "@/hooks/useImageCache";
import { useZip } from "@/hooks/useZip";
import { useTutorial } from "@/hooks/useTutorial";
import { encodeShareUrl } from "@/utils/share";

export function ComboDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, deleteCombo } = useCombo();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareState, setShareState] = useState<{
    url: string;
    warnings: string[];
  } | null>(null);
  const { images, getImageUrl } = useImageCache();
  const { exportCombos } = useZip();
  const tutorial = useTutorial("comboDetail");

  const combo = state.combos.find((c) => c.id === id);

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-gray-500">展開が見つかりません</p>
      </div>
    );
  }

  async function handleDownload() {
    if (combo) {
      const safeName = (combo.title || "combo").replace(/[/\\?%*:|"<>]/g, "_");
      await exportCombos([combo], `${safeName}.zip`);
    }
  }

  async function handleDelete() {
    if (id) {
      await deleteCombo(id);
      navigate("/");
    }
  }

  const sortedSteps = [...combo.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      <Header
        title={combo.title || "無題"}
        leftAction={
          <button
            onClick={() => navigate("/")}
            className="text-gray-300 hover:text-white"
          >
            <FiArrowLeft size={20} />
          </button>
        }
        actions={
          <>
            <button
              onClick={() => setShareState(encodeShareUrl(combo, images))}
              className="rounded-md bg-blue-900 p-2 text-gray-200 hover:bg-blue-800"
            >
              <FiShare2 size={16} />
            </button>
            <button
              onClick={handleDownload}
              className="rounded-md bg-blue-900 p-2 text-gray-200 hover:bg-blue-800"
            >
              <FiDownload size={16} />
            </button>
            <button
              onClick={() => navigate(`/combo/${id}/edit`)}
              className="rounded-md bg-blue-900 px-3 py-2 text-sm text-gray-200 hover:bg-blue-800"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md bg-red-700 p-2 text-red-200 hover:bg-red-600"
            >
              <FiTrash2 size={16} />
            </button>
          </>
        }
      />

      <main className="flex-1 space-y-4 p-4">
        <StartingCards
          cards={combo.startingCards}
          editable={false}
          getImageUrl={getImageUrl}
        />

        {sortedSteps.map((step, i) => (
          <StepCardReadonly
            key={step.id}
            step={step}
            index={i}
            getImageUrl={getImageUrl}
          />
        ))}
      </main>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          handleDelete();
        }}
        title="展開を削除"
        message="この展開を削除しますか？この操作は取り消せません。"
        confirmLabel="削除する"
      />

      <ShareModal
        isOpen={shareState !== null}
        onClose={() => setShareState(null)}
        url={shareState?.url ?? ""}
        warnings={shareState?.warnings ?? []}
      />

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
