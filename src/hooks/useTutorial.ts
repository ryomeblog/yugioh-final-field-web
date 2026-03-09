import { useState, useCallback } from "react";
import {
  TUTORIAL_STEPS,
  type TutorialPageKey,
  type TutorialStep,
} from "@/components/tutorial/tutorialSteps";

const STORAGE_KEY = "yugioh-tutorial-completed";

function getCompleted(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setCompleted(pageKey: TutorialPageKey, value: boolean) {
  const data = getCompleted();
  data[pageKey] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useTutorial(pageKey: TutorialPageKey) {
  const steps = TUTORIAL_STEPS[pageKey];
  const [stepIndex, setStepIndex] = useState<number | null>(() => {
    const completed = getCompleted();
    return completed[pageKey] ? null : 0;
  });

  const markComplete = useCallback(() => {
    setCompleted(pageKey, true);
    setStepIndex(null);
  }, [pageKey]);

  const next = useCallback(() => {
    setStepIndex((prev) => {
      if (prev === null) return null;
      if (prev >= steps.length - 1) {
        markComplete();
        return null;
      }
      return prev + 1;
    });
  }, [steps.length, markComplete]);

  const back = useCallback(() => {
    setStepIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  const skip = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const restart = useCallback(() => {
    setCompleted(pageKey, false);
    setStepIndex(0);
  }, [pageKey]);

  const isActive = stepIndex !== null;
  const currentStep: TutorialStep | null =
    stepIndex !== null ? (steps[stepIndex] ?? null) : null;

  return {
    isActive,
    currentStep,
    currentStepIndex: stepIndex ?? 0,
    totalSteps: steps.length,
    next,
    back,
    skip,
    restart,
  };
}

/** 設定画面用: ページ別のチュートリアル完了状態を取得/リセット */
export function getTutorialStatus(): Record<TutorialPageKey, boolean> {
  const data = getCompleted();
  return {
    home: !!data.home,
    comboEdit: !!data.comboEdit,
    comboDetail: !!data.comboDetail,
  };
}

export function resetTutorial(pageKey: TutorialPageKey) {
  setCompleted(pageKey, false);
}
