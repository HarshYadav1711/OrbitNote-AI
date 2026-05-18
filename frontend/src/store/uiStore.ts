import { create } from "zustand";

const STORAGE_KEY = "orbitnote-dark";

function readInitialDarkMode(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === "true";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

interface UIState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: readInitialDarkMode(),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(STORAGE_KEY, String(next));
      return { darkMode: next };
    }),
}));
