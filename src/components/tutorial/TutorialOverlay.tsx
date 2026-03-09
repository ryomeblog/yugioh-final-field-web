import { createPortal } from "react-dom";
import type { TutorialStep } from "./tutorialSteps";

interface TutorialOverlayProps {
  step: TutorialStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function TutorialOverlay({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: TutorialOverlayProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= totalSteps - 1;
  const imageUrl = `${import.meta.env.BASE_URL}${step.image}`;

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onSkip} />

      {/* Modal - 画面サイズに比例して拡大 */}
      <div
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-2xl sm:max-w-xl md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image — 固定アスペクト比で画像サイズを統一 */}
        <div className="relative aspect-video overflow-hidden bg-gray-900">
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 m-auto max-h-full max-w-full object-contain p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Content — min-h でテキスト長が変わってもモーダル高さを安定 */}
        <div className="p-4 sm:p-5">
          <p className="mb-4 min-h-[3rem] text-sm leading-relaxed text-gray-200 sm:text-base">
            {step.text}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === currentIndex ? "bg-blue-500" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onSkip}
                className="rounded px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200"
              >
                スキップ
              </button>
              {!isFirst && (
                <button
                  onClick={onBack}
                  className="rounded border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                >
                  戻る
                </button>
              )}
              <button
                onClick={onNext}
                className="rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
              >
                {isLast ? "完了" : "次へ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
