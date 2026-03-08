import type { ComboStep } from "@/types";
import { BoardMini } from "@/components/board/BoardMini";

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
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-4">
      <div className="flex gap-4">
        {/* Left: Text */}
        <div className="flex-1">
          <span className="text-xs font-bold text-red-500">
            Step {index + 1}
          </span>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">
            {step.text || "（テキストなし）"}
          </p>
        </div>

        {/* Right: Mini Board */}
        <div className="flex-shrink-0">
          <BoardMini
            board={step.board}
            cellSize={48}
            getImageUrl={getImageUrl}
          />
        </div>
      </div>
    </div>
  );
}
