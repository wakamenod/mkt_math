import { useContext } from "react";
import { ThemeContext, type ThemeValue } from "./ThemeProvider";

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme は ThemeProvider の内側で使ってください");
  return ctx;
}
