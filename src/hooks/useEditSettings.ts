import { useState, useCallback } from "react";

const STORAGE_KEY = "yugioh-edit-settings";

export interface EditSettings {
  /** 画像一覧のドラッグハンドルを表示するか */
  showDragHandle: boolean;
  /** 新規ステップ追加時に相手盤面を非表示にするか */
  hideOpponentBoard: boolean;
}

const DEFAULTS: EditSettings = {
  showDragHandle: false,
  hideOpponentBoard: false,
};

function loadSettings(): EditSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(settings: EditSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useEditSettings() {
  const [settings, setSettings] = useState<EditSettings>(loadSettings);

  const updateSettings = useCallback(
    (patch: Partial<EditSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        saveSettings(next);
        return next;
      });
    },
    [],
  );

  return { settings, updateSettings };
}

export function getEditSettings(): EditSettings {
  return loadSettings();
}
