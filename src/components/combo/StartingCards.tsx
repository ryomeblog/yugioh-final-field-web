import { useDroppable } from "@dnd-kit/core";
import { FiX } from "react-icons/fi";
import type { StartingCard } from "@/types";
import { CARD_RATIO } from "@/types";

const SC_W = 108;
const SC_H = Math.round(SC_W * CARD_RATIO);

interface StartingCardsProps {
  cards: StartingCard[];
  editable: boolean;
  onRemove?: (cardId: string) => void;
  getImageUrl?: (id: string) => string | null;
}

export function StartingCards({
  cards,
  editable,
  onRemove,
  getImageUrl,
}: StartingCardsProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "starting-cards",
    data: { type: "starting-cards" },
  });

  return (
    <div className="mb-4">
      <p className="mb-1 text-xs font-bold text-gray-400">初動札</p>
      <div
        ref={editable ? setNodeRef : undefined}
        className={`flex min-h-[80px] flex-wrap items-center gap-2 rounded-lg border p-3 transition-colors ${
          isOver
            ? "border-blue-400 bg-blue-900/20"
            : "border-gray-700 bg-gray-800/60"
        }`}
      >
        {cards
          .sort((a, b) => a.order - b.order)
          .map((sc) => {
            const url = getImageUrl?.(sc.imageId);
            return (
              <div
                key={sc.id}
                className="group relative"
                style={{ width: SC_W, height: SC_H }}
              >
                <div className="h-full w-full rounded bg-gray-700">
                  {url && (
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full rounded object-cover"
                    />
                  )}
                </div>
                {editable && (
                  <button
                    onClick={() => onRemove?.(sc.id)}
                    className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white group-hover:flex"
                  >
                    <FiX size={10} />
                  </button>
                )}
              </div>
            );
          })}
        {editable && cards.length === 0 && (
          <span className="text-xs text-gray-600">画面下部から D&D で配置</span>
        )}
      </div>
    </div>
  );
}
