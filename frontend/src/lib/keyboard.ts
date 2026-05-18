/** True when Ctrl (Windows/Linux) or Cmd (macOS) is held. */
export function isModKey(event: { metaKey: boolean; ctrlKey: boolean }): boolean {
  return event.metaKey || event.ctrlKey;
}

/** Platform-aware label for discoverability (e.g. "⌘K" or "Ctrl+K"). */
export function formatModShortcut(key: string, options?: { shift?: boolean }): string {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const shift = options?.shift ?? false;
  if (isMac) {
    return `⌘${shift ? "⇧" : ""}${key.toUpperCase()}`;
  }
  return `Ctrl+${shift ? "Shift+" : ""}${key.toUpperCase()}`;
}
