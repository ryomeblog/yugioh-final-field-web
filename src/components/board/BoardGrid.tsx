import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { BoardState } from "@/types";
import { DISABLED_CELLS } from "@/types";
import { ChainBadge } from "./ChainBadge";

interface BoardGridProps {
  board: BoardState;
  editable: boolean;
  onCellAction?: (row: number, col: number, action: "chain" | "delete") => void;
  getImageUrl?: (id: string) => string | null;
}

const CELL_SIZE = 48;
const GAP = 4;

function isDisabled(row: number, col: number) {
  return DISABLED_CELLS.some(([r, c]) => r === row && c === col);
}

function DroppableCell({
  row,
  col,
  cell,
  editable,
  getImageUrl,
  onAction,
}: {
  row: number;
  col: number;
  cell: { imageId: string | null; chainNumber: number | null } | null;
  editable: boolean;
  getImageUrl?: (id: string) => string | null;
  onAction?: (action: "chain" | "delete") => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: `board-${row}-${col}`,
    data: { type: "board-cell", row, col },
  });

  if (isDisabled(row, col)) {
    return <div className="h-12 w-12" />;
  }

  const hasImage = cell?.imageId != null;
  const imageUrl = hasImage && getImageUrl ? getImageUrl(cell!.imageId!) : null;

  return (
    <div
      ref={setNodeRef}
      className={`relative flex h-12 w-12 items-center justify-center rounded-sm border transition-colors ${
        isOver
          ? "border-blue-400 bg-blue-900/40"
          : row === 2
            ? "border-dashed border-red-500/50 bg-gray-800"
            : "border-gray-600 bg-gray-800"
      }`}
      onClick={() => {
        if (editable && hasImage) setShowMenu(!showMenu);
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full rounded-sm object-cover"
        />
      )}
      {cell?.chainNumber != null && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <ChainBadge
            number={cell.chainNumber}
            size={18}
            x={CELL_SIZE / 2}
            y={CELL_SIZE / 2}
          />
        </svg>
      )}
      {showMenu && editable && (
        <div className="absolute -top-1 left-full z-20 ml-1 flex flex-col gap-1 rounded-md bg-gray-700 p-1 shadow-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("chain");
              setShowMenu(false);
            }}
            className="whitespace-nowrap rounded px-2 py-1 text-xs text-white hover:bg-gray-600"
          >
            チェーン
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction?.("delete");
              setShowMenu(false);
            }}
            className="whitespace-nowrap rounded px-2 py-1 text-xs text-red-400 hover:bg-gray-600"
          >
            削除
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
            className="whitespace-nowrap rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-600"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}

export function BoardGrid({
  board,
  editable,
  onCellAction,
  getImageUrl,
}: BoardGridProps) {
  return (
    <div
      className="inline-grid gap-1"
      style={{
        gridTemplateColumns: `repeat(5, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(5, ${CELL_SIZE}px)`,
      }}
    >
      {board.cells.map((row, ri) =>
        row.map((cell, ci) => (
          <DroppableCell
            key={`${ri}-${ci}`}
            row={ri}
            col={ci}
            cell={cell}
            editable={editable}
            getImageUrl={getImageUrl}
            onAction={(action) => onCellAction?.(ri, ci, action)}
          />
        )),
      )}
    </div>
  );
}

export { CELL_SIZE, GAP };
