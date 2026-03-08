import { useReducer, useCallback, useEffect, type ReactNode } from "react";
import type { Combo } from "@/types";
import * as db from "@/db";
import { ComboContext, type ComboState } from "./comboContextValue";

type ComboAction =
  | { type: "SET_COMBOS"; payload: Combo[] }
  | { type: "ADD_COMBO"; payload: Combo }
  | { type: "UPDATE_COMBO"; payload: Combo }
  | { type: "DELETE_COMBO"; payload: string }
  | { type: "MERGE_COMBOS"; payload: Combo[] }
  | { type: "SET_LOADING"; payload: boolean };

function comboReducer(state: ComboState, action: ComboAction): ComboState {
  switch (action.type) {
    case "SET_COMBOS":
      return { ...state, combos: action.payload, isLoading: false };
    case "ADD_COMBO":
      return { ...state, combos: [...state.combos, action.payload] };
    case "UPDATE_COMBO":
      return {
        ...state,
        combos: state.combos.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };
    case "DELETE_COMBO":
      return {
        ...state,
        combos: state.combos.filter((c) => c.id !== action.payload),
      };
    case "MERGE_COMBOS": {
      const merged = [...state.combos];
      for (const incoming of action.payload) {
        const idx = merged.findIndex((c) => c.id === incoming.id);
        if (idx >= 0) {
          merged[idx] = incoming;
        } else {
          merged.push(incoming);
        }
      }
      return { ...state, combos: merged };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function ComboProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(comboReducer, {
    combos: [],
    isLoading: true,
  });

  const loadCombos = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    const combos = await db.getAllCombos();
    dispatch({ type: "SET_COMBOS", payload: combos });
  }, []);

  const addCombo = useCallback(async (combo: Combo) => {
    await db.putCombo(combo);
    dispatch({ type: "ADD_COMBO", payload: combo });
  }, []);

  const updateCombo = useCallback(async (combo: Combo) => {
    await db.putCombo(combo);
    dispatch({ type: "UPDATE_COMBO", payload: combo });
  }, []);

  const deleteCombo = useCallback(async (id: string) => {
    await db.deleteCombo(id);
    dispatch({ type: "DELETE_COMBO", payload: id });
  }, []);

  const mergeCombos = useCallback(async (combos: Combo[]) => {
    for (const combo of combos) {
      await db.putCombo(combo);
    }
    dispatch({ type: "MERGE_COMBOS", payload: combos });
  }, []);

  useEffect(() => {
    loadCombos();
  }, [loadCombos]);

  return (
    <ComboContext.Provider
      value={{
        state,
        addCombo,
        updateCombo,
        deleteCombo,
        mergeCombos,
        loadCombos,
      }}
    >
      {children}
    </ComboContext.Provider>
  );
}
