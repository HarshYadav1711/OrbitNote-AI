import { create } from "zustand";

interface UIState {
  darkMode: boolean;
  previewMarkdown: boolean;
  toggleDarkMode: () => void;
  togglePreview: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  previewMarkdown: true,
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      document.documentElement.classList.toggle("dark", next);
      return { darkMode: next };
    }),
  togglePreview: () => set((state) => ({ previewMarkdown: !state.previewMarkdown })),
}));
