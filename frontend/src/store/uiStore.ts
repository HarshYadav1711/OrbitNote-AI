import { create } from "zustand";
import { applyTheme, initThemeFromStorage, persistTheme } from "../lib/theme";

interface UIState {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
}

function setTheme(dark: boolean): void {
  applyTheme(dark);
  persistTheme(dark);
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: initThemeFromStorage(),
  setDarkMode: (dark) => {
    setTheme(dark);
    set({ darkMode: dark });
  },
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      setTheme(next);
      return { darkMode: next };
    }),
}));
