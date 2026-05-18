import { useEffect } from "react";
import { isModKey } from "../lib/keyboard";

type Handlers = {
  onSave: () => void;
  onNewNote: () => void;
  onFocusSearch: () => void;
  enabled?: boolean;
};

export function useWorkspaceShortcuts({
  onSave,
  onNewNote,
  onFocusSearch,
  enabled = true,
}: Handlers) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isModKey(event) || event.altKey) return;

      const key = event.key.toLowerCase();

      if (key === "s" && !event.shiftKey) {
        event.preventDefault();
        onSave();
        return;
      }

      if (key === "k" && !event.shiftKey) {
        event.preventDefault();
        onFocusSearch();
        return;
      }

      if (key === "n" && event.shiftKey) {
        event.preventDefault();
        onNewNote();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onSave, onNewNote, onFocusSearch, enabled]);
}
