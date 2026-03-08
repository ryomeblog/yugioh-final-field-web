import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { BoardState } from "@/types";
import { DISABLED_CELLS } from "@/types";
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

/** デスクトップ時の最大セルサイズ */
const MAX_CELL = 70;
const GAP = 4;
/** グリッド最大幅 */
const MAX_GRID_W = 5 * MAX_CELL + 4 * GAP;

/** カード画像の幅 (セル内%) — 86:59 比率 */
const IMG_W_PCT = `${(59 / 86) * 100}%`;

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
    return <div className="aspect-square" />;
  }

  const hasImage = cell?.imageId != null;
  const imageUrl = hasImage && getImageUrl ? getImageUrl(cell!.imageId!) : null;
  const position = cell?.position ?? "attack";
  const isDefense = position === "defense";

  return (
    <div
      ref={setNodeRef}
      className={`relative aspect-square rounded-sm border transition-colors ${
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
              width: IMG_W_PCT,
              height: "100%",
              transform: isDefense ? "rotate(-90deg)" : undefined,
            }}
            draggable={false}
          />
        </div>
      )}
      {cell?.chainNumber != null && (
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <ChainBadge number={cell.chainNumber} size={35} x={50} y={50} />
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
      className="grid w-full"
      style={{
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: `${GAP}px`,
        maxWidth: `${MAX_GRID_W}px`,
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
