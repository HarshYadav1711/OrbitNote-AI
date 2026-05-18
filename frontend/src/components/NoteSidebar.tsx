import type { Note } from "../types";
import { Spinner } from "./Spinner";

export type SidebarFilters = {
  search: string;
  tag: string;
  category: string;
  archived: boolean;
};

type Props = {
  notes: Note[];
  activeNoteId: number | null;
  filters: SidebarFilters;
  onFiltersChange: (patch: Partial<SidebarFilters>) => void;
  onSelectNote: (id: number) => void;
  onCreateNote: () => void;
  isLoading: boolean;
  isCreating: boolean;
  categories: string[];
  tags: string[];
};

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function NoteSidebar({
  notes,
  activeNoteId,
  filters,
  onFiltersChange,
  onSelectNote,
  onCreateNote,
  isLoading,
  isCreating,
  categories,
  tags,
}: Props) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search notes…"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-brand-500/30 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="button"
            onClick={onCreateNote}
            disabled={isCreating}
            title="New note"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-lg font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            +
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <FilterChip
            active={!filters.archived}
            onClick={() => onFiltersChange({ archived: false })}
          >
            Active
          </FilterChip>
          <FilterChip
            active={filters.archived}
            onClick={() => onFiltersChange({ archived: true })}
          >
            Archived
          </FilterChip>
        </div>

        {(categories.length > 0 || tags.length > 0) && (
          <div className="mt-2 space-y-2">
            {categories.length > 0 ? (
              <select
                aria-label="Filter by category"
                value={filters.category}
                onChange={(e) => onFiltersChange({ category: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            ) : null}
            {tags.length > 0 ? (
              <select
                aria-label="Filter by tag"
                value={filters.tag}
                onChange={(e) => onFiltersChange({ tag: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">All tags</option>
                {tags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Loading notes…" />
          </div>
        ) : notes.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            {filters.archived ? "No archived notes" : "No notes match your filters"}
          </p>
        ) : (
          <ul className="p-2">
            {notes.map((note) => {
              const active = note.id === activeNoteId;
              return (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => onSelectNote(note.id)}
                    className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left transition ${
                      active
                        ? "bg-white shadow-sm ring-1 ring-brand-500/30 dark:bg-slate-900"
                        : "hover:bg-white/70 dark:hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-sm font-medium">{note.title}</span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {formatRelative(note.updated_at)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                      {note.content.trim() || "Empty note"}
                    </p>
                    {(note.category || note.tags.length > 0) && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {note.category ? (
                          <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {note.category}
                          </span>
                        ) : null}
                        {note.tags.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700"
      }`}
    >
      {children}
    </button>
  );
}