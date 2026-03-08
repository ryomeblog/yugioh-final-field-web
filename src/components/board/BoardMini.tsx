import type { BoardState } from "@/types";
import { DISABLED_CELLS } from "@/types";
import { ChainBadge } from "./ChainBadge";

interface BoardMiniProps {
  board: BoardState;
  cellSize?: number;
  getImageUrl?: (id: string) => string | null;
}

/** カード画像幅の比率 (59/86) */
const IMG_W_RATIO = 59 / 86;

export function BoardMini({
  board,
  cellSize = 48,
  getImageUrl,
}: BoardMiniProps) {
  const gap = 2;
  const step = cellSize + gap;
  const width = 5 * step - gap;
  const height = 5 * step - gap;

  const innerW = Math.round(cellSize * IMG_W_RATIO);
  const innerH = cellSize;

  function isDisabled(row: number, col: number) {
    return DISABLED_CELLS.some(([r, c]) => r === row && c === col);
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {board.cells.map((row, ri) =>
        row.map((cell, ci) => {
          if (isDisabled(ri, ci)) return null;
          const x = ci * step;
          const y = ri * step;
          const hasImage = cell?.imageId != null;
          const imageUrl =
            hasImage && getImageUrl ? getImageUrl(cell!.imageId!) : null;
          const isDefense = (cell?.position ?? "attack") === "defense";

          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;

          return (
            <g key={`${ri}-${ci}`}>
              <rect
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                fill={hasImage ? "#4a4a6a" : "#2a2a4a"}
                stroke={ri === 2 ? "#e94560" : "#444"}
                strokeWidth={0.5}
                rx={1}
                strokeDasharray={ri === 2 ? "2,1" : undefined}
              />
              {imageUrl && (
                <g
                  transform={
                    isDefense ? `rotate(-90, ${cx}, ${cy})` : undefined
                  }
                >
                  <image
                    href={imageUrl}
                    x={cx - innerW / 2}
                    y={cy - innerH / 2}
                    width={innerW}
                    height={innerH}
                  />
                </g>
              )}
              {cell?.chainNumber != null && (
                <ChainBadge
                  number={cell.chainNumber}
                  size={cellSize * 0.4}
                  x={cx}
                  y={cy}
                />
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}
