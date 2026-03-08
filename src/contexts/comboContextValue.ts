import { createContext } from "react";
import type { Combo } from "@/types";

export interface ComboState {
  combos: Combo[];
  isLoading: boolean;
}

export interface ComboContextValue {
  state: ComboState;
  addCombo: (combo: Combo) => Promise<void>;
  updateCombo: (combo: Combo) => Promise<void>;
  deleteCombo: (id: string) => Promise<void>;
  mergeCombos: (combos: Combo[]) => Promise<void>;
  loadCombos: () => Promise<void>;
}

export const ComboContext = createContext<ComboContextValue | null>(null);
