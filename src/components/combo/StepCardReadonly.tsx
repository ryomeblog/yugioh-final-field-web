import type { ComboStep } from "@/types";
import { BoardMini } from "@/components/board/BoardMini";
import { useIsMobile } from "@/hooks/useIsMobile";

interface StepCardReadonlyProps {
  step: ComboStep;
  index: number;
  getImageUrl?: (id: string) => string | null;
}

export function StepCardReadonly({
  step,
  index,
  getImageUrl,
}: StepCardReadonlyProps) {
  const isMobile = useIsMobile();
  const miniCellSize = isMobile ? 36 : 48;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-3 sm:p-4">
      <span className="text-xs font-bold text-red-500">Step {index + 1}</span>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-4">
        {/* Text */}
        <div className="flex-1">
          <p className="whitespace-pre-wrap text-sm text-gray-200">
            {step.text || "（テキストなし）"}
          </p>
        </div>

        {/* Mini Board */}
        <div className="flex-shrink-0">
          <BoardMini
            board={step.board}
            cellSize={miniCellSize}
            getImageUrl={getImageUrl}
          />
        </div>
      </div>
    </div>
  );
}
