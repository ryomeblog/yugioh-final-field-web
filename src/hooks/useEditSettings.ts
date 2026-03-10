import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "yugioh-edit-settings";

export interface EditSettings {
  /** 画像一覧のドラッグハンドルを表示するか */
  showDragHandle: boolean;
  /** 新規ステップ追加時に相手盤面を表示するか */
  showOpponentBoard: boolean;
}

const DEFAULTS: EditSettings = {
  showDragHandle: false,
  showOpponentBoard: true,
};

function loadFromStorage(): EditSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

/** キャッシュされたスナップショット (参照安定性を保つ) */
let cachedSettings: EditSettings = loadFromStorage();

const listeners = new Set<() => void>();

function emitChange() {
  cachedSettings = loadFromStorage();
  for (const fn of listeners) fn();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): EditSettings {
  return cachedSettings;
}

export function useEditSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot);

  const updateSettings = useCallback((patch: Partial<EditSettings>) => {
    const next = { ...cachedSettings, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }, []);

  return { settings, updateSettings };
}

export function getEditSettings(): EditSettings {
  return cachedSettings;
}
