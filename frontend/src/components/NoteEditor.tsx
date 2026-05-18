import { useState } from "react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { NoteAIPanel } from "./NoteAIPanel";
import { ShareControls } from "./ShareControls";
import { MarkdownPreview } from "./MarkdownPreview";
import { SaveStatus } from "./SaveStatus";
import { LoadingPlaceholder } from "./LoadingPlaceholder";
import { useNoteAI } from "../hooks/useNoteAI";
import type { NoteDraft, SaveStatus as Status } from "../hooks/useNoteEditor";
import type { Note } from "../types";

type Props = {
  noteId: number | null;
  draft: NoteDraft | null;
  onDraftChange: (patch: Partial<NoteDraft>) => void;
  saveStatus: Status;
  note: Note | undefined;
  isLoading: boolean;
  isError: boolean;
  onArchive: (archived: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
  onCreateNote: () => void;
  isCreating: boolean;
  onSaveNow: () => void;
};

export function NoteEditor({
  noteId,
  draft,
  onDraftChange,
  saveStatus,
  note,
  isLoading,
  isError,
  onArchive,
  onDelete,
  isDeleting,
  onCreateNote,
  isCreating,
  onSaveNow,
}: Props) {
  const [showAssistMobile, setShowAssistMobile] = useState(false);
  const ai = useNoteAI(noteId, draft);

  const handleAppendActions = (items: { text: string }[]) => {
    if (!draft) return;
    const lines = items.map((i) => `- [ ] ${i.text}`).join("\n");
    const block = draft.content.trim()
      ? `\n\n## Action items\n${lines}`
      : `## Action items\n${lines}`;
    onDraftChange({ content: draft.content + block });
  };

  if (isLoading) {
    return <LoadingPlaceholder label="Opening note…" />;
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <EmptyState
          title="Note not found"
          description="This note may have been deleted or you don't have access."
        />
      </div>
    );
  }

  if (!draft || !note) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <EmptyState
          title="Select a note"
          description="Pick a note from the list, or create one to get started."
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

  const assistPanel = (
    <NoteAIPanel
      summary={ai.summary}
      actions={ai.actions}
      title={ai.title}
      showHistory={ai.showHistory}
      onToggleHistory={() => ai.setShowHistory((v) => !v)}
      history={ai.history}
      isHistoryLoading={ai.isHistoryLoading}
      isSummaryLoading={ai.isSummaryLoading}
      isActionsLoading={ai.isActionsLoading}
      isTitleLoading={ai.isTitleLoading}
      hasContent={ai.hasContent}
      onGenerateSummary={ai.generateSummary}
      onGenerateActions={ai.generateActions}
      onGenerateTitle={ai.generateTitle}
      onApplyTitle={(t) => onDraftChange({ title: t })}
      onAppendActions={handleAppendActions}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-3.5 dark:border-slate-800">
          <SaveStatus status={saveStatus} onRetry={saveStatus === "error" ? onSaveNow : undefined} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {note.is_public && note.share_token ? (
              <span
                className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                title={`Shared link active since ${updatedLabel}`}
              >
                Shared
              </span>
            ) : null}
            <Button
              variant="ghost"
              className="text-xs lg:hidden"
              onClick={() => setShowAssistMobile((v) => !v)}
            >
              {showAssistMobile ? "Hide assist" : "Assist"}
            </Button>
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
            <Button
              variant="danger"
              className="text-xs"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => onDraftChange({ title: e.target.value })}
            placeholder="Title"
            aria-label="Note title"
            className="w-full border-0 bg-transparent text-2xl font-semibold outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Category
              </span>
              <input
                type="text"
                value={draft.category}
                onChange={(e) => onDraftChange({ category: e.target.value })}
                placeholder="Work, personal…"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tags
              </span>
              <input
                type="text"
                value={draft.tags}
                onChange={(e) => onDraftChange({ tags: e.target.value })}
                placeholder="work, ideas"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          </div>

          <div className="mt-6 flex min-h-[40vh] flex-1 flex-col gap-4 lg:min-h-[50vh] lg:flex-row lg:gap-0 lg:divide-x lg:divide-slate-200 dark:lg:divide-slate-800">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pr-5">
              <textarea
                value={draft.content}
                onChange={(e) => onDraftChange({ content: e.target.value })}
                placeholder="Write in Markdown…"
                aria-label="Note content"
                className="min-h-[28vh] w-full flex-1 resize-none border-0 bg-transparent text-base leading-relaxed outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 lg:min-h-0"
              />
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col border-t border-slate-200 pt-4 dark:border-slate-800 lg:border-t-0 lg:pt-0 lg:pl-5">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Preview
              </span>
              <MarkdownPreview content={draft.content} className="min-h-0 flex-1 overflow-y-auto" />
            </div>
          </div>

          <div className="mt-6 max-w-md">
            <ShareControls note={note} />
          </div>
        </div>

        {showAssistMobile ? <div className="lg:hidden">{assistPanel}</div> : null}
      </div>

      <div className="hidden lg:flex">{assistPanel}</div>
    </div>
  );
}
