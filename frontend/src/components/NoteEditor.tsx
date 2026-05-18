import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { SaveStatus } from "./SaveStatus";
import { Spinner } from "./Spinner";
import type { NoteDraft, SaveStatus as Status } from "../hooks/useNoteEditor";
import type { Note } from "../types";

type Props = {
  draft: NoteDraft | null;
  onDraftChange: (patch: Partial<NoteDraft>) => void;
  saveStatus: Status;
  note: Note | undefined;
  isLoading: boolean;
  isError: boolean;
  onArchive: (archived: boolean) => void;
  onCreateNote: () => void;
  isCreating: boolean;
};

export function NoteEditor({
  draft,
  onDraftChange,
  saveStatus,
  note,
  isLoading,
  isError,
  onArchive,
  onCreateNote,
  isCreating,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner label="Loading note…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <EmptyState
          title="Note not found"
          description="This note may have been removed or you no longer have access."
        />
      </div>
    );
  }

  if (!draft || !note) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <EmptyState
          title="Select a note"
          description="Pick a note from the sidebar or create a new one to start writing."
          action={
            <Button onClick={onCreateNote} disabled={isCreating}>
              {isCreating ? "Creating…" : "New note"}
            </Button>
          }
        />
      </div>
    );
  }

  const updatedLabel = new Date(note.updated_at).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-3 dark:border-slate-800">
        <SaveStatus status={saveStatus} />
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:inline">Updated {updatedLabel}</span>
          {note.is_archived ? (
            <Button variant="secondary" onClick={() => onArchive(false)}>
              Restore
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => onArchive(true)}>
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onDraftChange({ title: e.target.value })}
          placeholder="Title"
          className="w-full border-0 bg-transparent text-2xl font-semibold outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Category
            </span>
            <input
              type="text"
              value={draft.category}
              onChange={(e) => onDraftChange({ category: e.target.value })}
              placeholder="e.g. work, personal"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Tags
            </span>
            <input
              type="text"
              value={draft.tags}
              onChange={(e) => onDraftChange({ tags: e.target.value })}
              placeholder="comma-separated"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>

        <textarea
          value={draft.content}
          onChange={(e) => onDraftChange({ content: e.target.value })}
          placeholder="Start writing…"
          className="mt-6 min-h-[50vh] w-full flex-1 resize-none border-0 bg-transparent text-base leading-relaxed outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}
