import { useContext } from "react";
import {
  ComboContext,
  type ComboContextValue,
} from "@/contexts/comboContextValue";

export function useCombo(): ComboContextValue {
  const ctx = useContext(ComboContext);
  if (!ctx) {
    throw new Error("useCombo must be used within ComboProvider");
  }
  return ctx;
}
