import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiTrash2, FiMenu } from "react-icons/fi";
import type { ComboStep, BoardState } from "@/types";
import { BoardGrid, type CellAction } from "@/components/board/BoardGrid";

interface StepCardProps {
  step: ComboStep;
  index: number;
  onTextChange: (text: string) => void;
  onBoardChange: (board: BoardState) => void;
  onDelete: () => void;
  getImageUrl?: (id: string) => string | null;
  onToggleOpponentBoard?: (show: boolean) => void;
}

export function StepCard({
  step,
  index,
  onTextChange,
  onBoardChange,
  onDelete,
  getImageUrl,
  onToggleOpponentBoard,
}: StepCardProps) {
  const showOpponent = step.showOpponentBoard !== false;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleCellAction(row: number, col: number, action: CellAction) {
    const newCells = step.board.cells.map((r) =>
      r.map((c) => (c ? { ...c } : null)),
    );
    const cell = newCells[row][col];
    if (!cell) return;

    switch (action.type) {
      case "delete":
        cell.imageId = null;
        cell.chainNumber = null;
        cell.position = undefined;
        break;
      case "chain-add": {
        const maxChain = newCells
          .flat()
          .filter((c) => c?.chainNumber != null)
          .reduce((max, c) => Math.max(max, c!.chainNumber!), 0);
        cell.chainNumber = maxChain + 1;
        break;
      }
      case "chain-remove":
        cell.chainNumber = null;
        break;
      case "chain-set":
        cell.chainNumber = Math.max(1, action.value);
        break;
      case "toggle-position":
        cell.position =
          (cell.position ?? "attack") === "attack" ? "defense" : "attack";
        break;
    }

    onBoardChange({ cells: newCells });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative rounded-lg border border-gray-700 bg-gray-800/60 transition-colors"
    >
      <div className="flex">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          style={{ touchAction: "none" }}
          className="flex w-5 cursor-grab items-center justify-center rounded-l-lg bg-gray-700/50 text-gray-500 hover:text-gray-300"
        >
          <FiMenu size={14} />
        </div>

        <div className="flex-1 p-3">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-red-500">
              Step {index + 1}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded bg-red-900/50 p-1 text-red-400 hover:bg-red-800"
            >
              <FiTrash2 size={12} />
            </button>
          </div>

          {/* Text */}
          <textarea
            value={step.text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="展開の解説を入力..."
            rows={3}
            className="mb-3 w-full resize-none rounded bg-gray-900 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:ring-1 focus:ring-red-500"
          />

          {/* Board */}
          <div className="mb-1 flex items-center gap-2">
            <p className="text-xs text-gray-400">盤面:</p>
            <label className="flex cursor-pointer items-center gap-1.5">
              <span className="text-[10px] text-gray-500">相手盤面</span>
              <button
                onClick={() => onToggleOpponentBoard?.(!showOpponent)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                  showOpponent ? "bg-green-600" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 rounded-full bg-white shadow transition-transform ${
                    showOpponent ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
          <BoardGrid
            board={step.board}
            editable={true}
            isDropTarget={true}
            droppablePrefix={`step-${step.id}`}
            onCellAction={handleCellAction}
            getImageUrl={getImageUrl}
            hideRows={showOpponent ? undefined : [0, 1]}
          />
        </div>
      </div>
    </div>
  );
}
