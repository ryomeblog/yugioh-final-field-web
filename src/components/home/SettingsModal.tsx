import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { getTutorialStatus, resetTutorial } from "@/hooks/useTutorial";
import type { TutorialPageKey } from "@/components/tutorial/tutorialSteps";
import {
  useEditSettings,
  type EditSettings,
} from "@/hooks/useEditSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "yugioh-tutorial-completed";

const TUTORIAL_PAGES: { key: TutorialPageKey; label: string }[] = [
  { key: "home", label: "ホーム画面" },
  { key: "comboEdit", label: "展開作成・編集画面" },
  { key: "comboDetail", label: "展開詳細画面" },
];

const EDIT_SETTINGS_ITEMS: {
  key: keyof EditSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "showDragHandle",
    label: "画像一覧の持ち手を表示",
    description:
      "オンにすると画像一覧でドラッグ用の持ち手が表示されます。スマホで横スクロールしやすくなります。",
  },
  {
    key: "hideOpponentBoard",
    label: "相手盤面を初期非表示",
    description:
      "オンにすると新規ステップ追加時に相手盤面が閉じた状態になります。各ステップで個別に切り替えできます。",
  },
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

function Toggle({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors ${
        isOn ? "bg-green-600" : "bg-gray-500"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          isOn ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [status, setStatus] = useState(getTutorialStatus);
  const { settings: editSettings, updateSettings: updateEditSettings } =
    useEditSettings();

  function handleTutorialToggle(key: TutorialPageKey) {
    const currentlyCompleted = status[key];
    if (currentlyCompleted) {
      resetTutorial(key);
      setStatus((prev) => ({ ...prev, [key]: false }));
    } else {
      setTutorialCompleted(key, true);
      setStatus((prev) => ({ ...prev, [key]: true }));
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="設定">
      {/* 編集設定 */}
      <div className="space-y-1">
        <p className="mb-2 text-xs font-bold text-gray-300">編集設定</p>
        {EDIT_SETTINGS_ITEMS.map(({ key, label, description }) => {
          const isOn = editSettings[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-gray-700/50 px-3 py-3"
            >
              <div className="mr-3 flex-1">
                <span className="text-sm text-gray-200">{label}</span>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  {description}
                </p>
              </div>
              <Toggle
                isOn={isOn}
                onToggle={() => updateEditSettings({ [key]: !isOn })}
              />
            </div>
          );
        })}
      </div>

      {/* チュートリアル設定 */}
      <div className="mt-4 space-y-1">
        <p className="mb-2 text-xs font-bold text-gray-300">チュートリアル</p>
        <p className="mb-2 text-[10px] text-gray-400">
          オフにすると次回ページ表示時にチュートリアルが表示されます。
        </p>
        {TUTORIAL_PAGES.map(({ key, label }) => {
          const isOn = status[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg bg-gray-700/50 px-3 py-3"
            >
              <span className="text-sm text-gray-200">{label}</span>
              <Toggle
                isOn={isOn}
                onToggle={() => handleTutorialToggle(key)}
              />
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
