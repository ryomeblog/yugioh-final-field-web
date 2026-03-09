import { useDroppable } from "@dnd-kit/core";
import { FiX } from "react-icons/fi";
import type { StartingCard } from "@/types";
import { CARD_RATIO } from "@/types";
import { useIsMobile } from "@/hooks/useIsMobile";

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

  const isMobile = useIsMobile();
  const cardW = isMobile ? 64 : 108;
  const cardH = Math.round(cardW * CARD_RATIO);

  return (
    <div className="mb-4">
      <p className="mb-1 text-xs font-bold text-gray-400">初動札</p>
      <div
        ref={editable ? setNodeRef : undefined}
        className={`flex min-h-[60px] flex-wrap items-center gap-2 rounded-lg border p-2 transition-colors sm:p-3 ${
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
                style={{ width: cardW, height: cardH }}
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
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white"
                  >
                    <FiX size={14} />
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
