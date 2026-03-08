import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { BoardState } from "@/types";
import { DISABLED_CELLS, CARD_RATIO } from "@/types";
import { ChainBadge } from "./ChainBadge";

export type CellAction =
  | { type: "chain-add" }
  | { type: "chain-remove" }
  | { type: "chain-set"; value: number }
  | { type: "delete" }
  | { type: "toggle-position" };

interface BoardGridProps {
  board: BoardState;
  editable: boolean;
  isDropTarget?: boolean;
  onCellAction?: (row: number, col: number, action: CellAction) => void;
  getImageUrl?: (id: string) => string | null;
}

/** セルは正方形 */
export const CELL_SIZE = 70;
const GAP = 4;

/** セル内カードの幅 (86:59 比率から算出) */
const INNER_W = Math.round(CELL_SIZE / CARD_RATIO);
const INNER_H = CELL_SIZE;

function isDisabled(row: number, col: number) {
  return DISABLED_CELLS.some(([r, c]) => r === row && c === col);
}

function DroppableCell({
  row,
  col,
  cell,
  editable,
  isDropTarget,
  getImageUrl,
  onAction,
}: {
  row: number;
  col: number;
  cell: {
    imageId: string | null;
    chainNumber: number | null;
    position?: "attack" | "defense";
  } | null;
  editable: boolean;
  isDropTarget?: boolean;
  getImageUrl?: (id: string) => string | null;
  onAction?: (action: CellAction) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: `board-${row}-${col}`,
    data: { type: "board-cell", row, col },
    disabled: !isDropTarget,
  });

  if (isDisabled(row, col)) {
    return <div style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
  }

  const hasImage = cell?.imageId != null;
  const imageUrl = hasImage && getImageUrl ? getImageUrl(cell!.imageId!) : null;
  const position = cell?.position ?? "attack";
  const isDefense = position === "defense";

  return (
    <div
      ref={setNodeRef}
      style={{ width: CELL_SIZE, height: CELL_SIZE }}
      className={`relative flex items-center justify-center rounded-sm border transition-colors ${
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
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm">
          <img
            src={imageUrl}
            alt=""
            className="object-cover"
            style={{
              width: INNER_W,
              height: INNER_H,
              transform: isDefense ? "rotate(-90deg)" : undefined,
            }}
            draggable={false}
          />
        </div>
      )}
      {cell?.chainNumber != null && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <ChainBadge
            number={cell.chainNumber}
            size={28}
            x={CELL_SIZE / 2}
            y={CELL_SIZE / 2}
          />
        </svg>
      )}
      {showMenu && editable && (
        <div
          className="absolute -top-1 left-full z-20 ml-1 flex flex-col gap-1 rounded-md bg-gray-700 p-2 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chain controls */}
          {cell?.chainNumber != null ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (cell.chainNumber! > 1) {
                    onAction?.({
                      type: "chain-set",
                      value: cell.chainNumber! - 1,
                    });
                  }
                }}
                disabled={cell.chainNumber! <= 1}
                className="flex h-6 w-6 items-center justify-center rounded bg-gray-600 text-xs text-white hover:bg-gray-500 disabled:opacity-40"
              >
                −
              </button>
              <span className="w-6 text-center text-xs font-bold text-white">
                {cell.chainNumber}
              </span>
              <button
                onClick={() => {
                  onAction?.({
                    type: "chain-set",
                    value: cell.chainNumber! + 1,
                  });
                }}
                className="flex h-6 w-6 items-center justify-center rounded bg-gray-600 text-xs text-white hover:bg-gray-500"
              >
                +
              </button>
              <button
                onClick={() => {
                  onAction?.({ type: "chain-remove" });
                  setShowMenu(false);
                }}
                className="ml-1 flex h-6 items-center rounded bg-red-900/60 px-1 text-[10px] text-red-300 hover:bg-red-800"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onAction?.({ type: "chain-add" });
                setShowMenu(false);
              }}
              className="whitespace-nowrap rounded px-2 py-1 text-xs text-white hover:bg-gray-600"
            >
              チェーン追加
            </button>
          )}
          {/* Position toggle */}
          <button
            onClick={() => {
              onAction?.({ type: "toggle-position" });
            }}
            className="whitespace-nowrap rounded px-2 py-1 text-xs text-yellow-300 hover:bg-gray-600"
          >
            {isDefense ? "攻撃表示" : "守備表示"}
          </button>
          {/* Delete card */}
          <button
            onClick={() => {
              onAction?.({ type: "delete" });
              setShowMenu(false);
            }}
            className="whitespace-nowrap rounded px-2 py-1 text-xs text-red-400 hover:bg-gray-600"
          >
            削除
          </button>
          {/* Close */}
          <button
            onClick={() => setShowMenu(false)}
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
  isDropTarget,
  onCellAction,
  getImageUrl,
}: BoardGridProps) {
  return (
    <div
      className="inline-grid"
      style={{
        gridTemplateColumns: `repeat(5, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(5, ${CELL_SIZE}px)`,
        gap: `${GAP}px`,
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
            isDropTarget={isDropTarget}
            getImageUrl={getImageUrl}
            onAction={(action) => onCellAction?.(ri, ci, action)}
          />
        )),
      )}
    </div>
  );
}

export { GAP };
