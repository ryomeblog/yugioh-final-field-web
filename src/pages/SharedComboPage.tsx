import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DndContext } from "@dnd-kit/core";
import { FiArrowLeft } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { StartingCards } from "@/components/combo/StartingCards";
import { StepCardReadonly } from "@/components/combo/StepCardReadonly";
import { decodeShareData, shareDataToCombo } from "@/utils/share";

export function SharedComboPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const encoded = searchParams.get("d");

  const result = useMemo(() => {
    if (!encoded) return null;
    try {
      const data = decodeShareData(encoded);
      return shareDataToCombo(data);
    } catch {
      return null;
    }
  }, [encoded]);

  if (!encoded || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500">共有データの読み込みに失敗しました</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 rounded-md bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const { combo, getImageUrl } = result;
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
      />

      <main className="flex-1 space-y-4 p-4">
        {/* DndContext は StartingCards 内の useDroppable に必要 */}
        <DndContext>
          <StartingCards
            cards={combo.startingCards}
            editable={false}
            getImageUrl={getImageUrl}
          />
        </DndContext>

        {sortedSteps.map((step, i) => (
          <StepCardReadonly
            key={step.id}
            step={step}
            index={i}
            getImageUrl={getImageUrl}
          />
        ))}
      </main>
    </div>
  );
}
