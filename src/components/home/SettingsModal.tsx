import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { getTutorialStatus, resetTutorial } from "@/hooks/useTutorial";
import type { TutorialPageKey } from "@/components/tutorial/tutorialSteps";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "yugioh-tutorial-completed";

const PAGES: { key: TutorialPageKey; label: string }[] = [
  { key: "home", label: "ホーム画面" },
  { key: "comboEdit", label: "展開作成・編集画面" },
  { key: "comboDetail", label: "展開詳細画面" },
];

function setTutorialCompleted(pageKey: TutorialPageKey, value: boolean) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    data[pageKey] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  // isOpen が false のとき null を返すので、開くたびに再マウントされ最新状態を取得
  const [status, setStatus] = useState(getTutorialStatus);

  function handleToggle(key: TutorialPageKey) {
    const currentlyCompleted = status[key];
    if (currentlyCompleted) {
      // ON→OFF: チュートリアルを表示する (リセット)
      resetTutorial(key);
      setStatus((prev) => ({ ...prev, [key]: false }));
    } else {
      // OFF→ON: チュートリアルを非表示にする (完了扱い)
      setTutorialCompleted(key, true);
      setStatus((prev) => ({ ...prev, [key]: true }));
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="設定">
      <div className="space-y-1">
        <p className="mb-3 text-xs text-gray-400">
          オフにすると次回ページ表示時にチュートリアルが表示されます。
        </p>
        {PAGES.map(({ key, label }) => {
          const isOn = status[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-gray-700/50 px-3 py-3"
            >
              <span className="text-sm text-gray-200">{label}</span>
              <button
                onClick={() => handleToggle(key)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  isOn ? "bg-green-600" : "bg-gray-500"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    isOn ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-md bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
        >
          閉じる
        </button>
      </div>
    </Modal>
  );
}
