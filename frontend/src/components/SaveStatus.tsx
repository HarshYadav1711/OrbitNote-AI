import type { SaveStatus as Status } from "../hooks/useNoteEditor";

type Props = { status: Status };

const labels: Record<Status, string | null> = {
  idle: null,
  unsaved: "Unsaved changes",
  saving: "Saving…",
  saved: "Saved",
  error: "Could not save",
};

export function SaveStatus({ status }: Props) {
  const label = labels[status];
  if (!label) return null;

  const color =
    status === "error"
      ? "text-red-600 dark:text-red-400"
      : status === "saved"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-slate-500";

  return (
    <span className={`text-xs font-medium tabular-nums transition-opacity ${color}`} aria-live="polite">
      {status === "saving" ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
          {label}
        </span>
      ) : (
        label
      )}
    </span>
  );
}
