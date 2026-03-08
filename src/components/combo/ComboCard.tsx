import { FiCheck } from "react-icons/fi";
import type { Combo } from "@/types";
import { CARD_RATIO } from "@/types";

const THUMB_W = 84;
const THUMB_H = Math.round(THUMB_W * CARD_RATIO);

interface ComboCardProps {
  combo: Combo;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  getImageUrl?: (id: string) => string | null;
}

export function ComboCard({
  combo,
  onClick,
  selectable,
  selected,
  onSelect,
  getImageUrl,
}: ComboCardProps) {
  function handleClick() {
    if (selectable) {
      onSelect?.();
    } else {
      onClick?.();
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer rounded-lg border p-3 transition-colors hover:border-gray-500 ${
        selected
          ? "border-red-500 bg-gray-800"
          : "border-gray-700 bg-gray-800/60"
      }`}
    >
      <div className="flex gap-3">
        {/* Left: info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-bold text-white">
              {combo.title || "無題"}
            </h3>
            {selectable && (
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  selected
                    ? "border-red-500 bg-red-500"
                    : "border-gray-500 bg-transparent"
                }`}
              >
                {selected && <FiCheck size={12} className="text-white" />}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-600">
            {new Date(combo.updatedAt).toLocaleDateString("ja-JP")} 更新
          </p>
        </div>
        {/* Right: starting cards */}
        <div className="flex flex-shrink-0 flex-wrap gap-1">
          {combo.startingCards.map((sc) => {
            const url = getImageUrl?.(sc.imageId);
            return (
              <div
                key={sc.id}
                className="rounded bg-gray-700"
                style={{ width: THUMB_W, height: THUMB_H }}
              >
                {url && (
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full rounded object-cover"
                  />
                )}
              </div>
            );
          })}
          {combo.startingCards.length === 0 && (
            <span className="text-xs text-gray-600">なし</span>
          )}
        </div>
      </div>
    </div>
  );
}
