import { useEffect } from "react";

type Handlers = {
  onSave: () => void;
  onNewNote: () => void;
  enabled?: boolean;
};

export function useWorkspaceShortcuts({ onSave, onNewNote, enabled = true }: Handlers) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;

      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        onSave();
      } else if (key === "n") {
        event.preventDefault();
        onNewNote();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSave, onNewNote, enabled]);
}
