import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import { Header } from "@/components/layout/Header";
import { StartingCards } from "@/components/combo/StartingCards";
import { StepCardReadonly } from "@/components/combo/StepCardReadonly";
import { useCombo } from "@/hooks/useCombo";
import { useImageCache } from "@/hooks/useImageCache";

export function ComboDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useCombo();
  const { getImageUrl } = useImageCache();

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
          <button
            onClick={() => navigate(`/combo/${id}/edit`)}
            className="rounded-md bg-blue-900 px-3 py-2 text-sm text-gray-200 hover:bg-blue-800"
          >
            <FiEdit2 size={16} />
          </button>
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
    </div>
  );
}
