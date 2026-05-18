import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatModShortcut } from "../lib/keyboard";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import {
  isOptimisticNoteId,
  prependNoteToActiveLists,
  replaceTempNoteInCaches,
  restoreNotesCaches,
  snapshotNotesCaches,
} from "../lib/noteCache";
import { NoteEditor } from "../components/NoteEditor";
import { NoteSidebar, type SidebarFilters } from "../components/NoteSidebar";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";
import { useDebounce } from "../hooks/useDebounce";
import { useNoteEditor } from "../hooks/useNoteEditor";
import { useWorkspaceShortcuts } from "../hooks/useWorkspaceShortcuts";
import type { Note } from "../types";

function collectFacets(notes: Note[]) {
  const categories = new Set<string>();
  const tags = new Set<string>();
  for (const note of notes) {
    if (note.category) categories.add(note.category);
    for (const t of note.tags) tags.add(t.name);
  }
  return {
    categories: [...categories].sort(),
    tags: [...tags].sort(),
  };
}

export function WorkspacePage() {
  const navigate = useNavigate();
  const { noteId: noteIdParam } = useParams();
  const parsedId = noteIdParam ? Number(noteIdParam) : NaN;
  const noteId = Number.isFinite(parsedId) ? parsedId : null;
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<SidebarFilters>({
    search: "",
    tag: "",
    category: "",
    archived: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusSearch = useCallback(() => {
    setSidebarOpen(true);
    const input = searchInputRef.current;
    if (!input) return;
    input.focus({ preventScroll: false });
    input.select();
  }, []);

  const debouncedSearch = useDebounce(filters.search, 200);

  const notesQuery = useQuery({
    queryKey: ["notes", filters.archived, debouncedSearch, filters.tag, filters.category],
    queryFn: () =>
      api.notes({
        archived: filters.archived,
        q: debouncedSearch || undefined,
        tag: filters.tag || undefined,
        category: filters.category || undefined,
        sort: "updated_desc",
      }),
    placeholderData: (prev) => prev,
  });

  const allNotesQuery = useQuery({
    queryKey: ["notes", "facets"],
    queryFn: () => api.notes({ archived: false }),
  });

  const { categories, tags } = useMemo(
    () => collectFacets(allNotesQuery.data ?? []),
    [allNotesQuery.data],
  );

  const editor = useNoteEditor(noteId);

  const createMutation = useMutation({
    mutationFn: () => api.createNote({ title: "Untitled", content: "", tags: [] }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousLists = snapshotNotesCaches(queryClient);
      const tempId = -Date.now();
      const now = new Date().toISOString();
      const optimisticNote: Note = {
        id: tempId,
        title: "Untitled",
        content: "",
        category: null,
        is_archived: false,
        is_public: false,
        share_token: null,
        tags: [],
        created_at: now,
        updated_at: now,
      };

      prependNoteToActiveLists(queryClient, optimisticNote);

      navigate(`/app/${tempId}`);
      setSidebarOpen(false);

      return { previousLists, tempId };
    },
    onSuccess: (note, _vars, context) => {
      if (!context) return;
      replaceTempNoteInCaches(queryClient, context.tempId, note);
      if (window.location.pathname.endsWith(`/${context.tempId}`)) {
        navigate(`/app/${note.id}`, { replace: true });
      }
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      restoreNotesCaches(queryClient, context.previousLists);
      queryClient.removeQueries({ queryKey: ["note", context.tempId] });
      if (window.location.pathname.endsWith(`/${context.tempId}`)) {
        const remaining =
          queryClient
            .getQueriesData<Note[]>({ queryKey: ["notes"] })
            .flatMap(([, list]) => list ?? [])
            .filter((n) => !isOptimisticNoteId(n.id)) ?? [];
        navigate(remaining.length > 0 ? `/app/${remaining[0].id}` : "/app", { replace: true });
      }
    },
  });

  const handleSelectNote = (id: number) => {
    navigate(`/app/${id}`);
    setSidebarOpen(false);
  };

  const handleCreateNote = () => createMutation.mutate();

  const handleArchive = (archived: boolean) => {
    editor.archive(archived);
    if (archived) {
      navigate("/app");
    }
  };

  const listQueryKey = ["notes", filters.archived, debouncedSearch, filters.tag, filters.category] as const;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteNote(id),
    onSuccess: (_data, deletedId) => {
      queryClient.removeQueries({ queryKey: ["note", deletedId] });
      queryClient.setQueryData<Note[]>(listQueryKey, (prev) =>
        prev?.filter((n) => n.id !== deletedId),
      );
      queryClient.setQueryData<Note[]>(["notes", "facets"], (prev) =>
        prev?.filter((n) => n.id !== deletedId),
      );
      queryClient.invalidateQueries({ queryKey: ["notes"], refetchType: "none" });
      const remaining = queryClient.getQueryData<Note[]>(listQueryKey) ?? [];
      navigate(remaining.length > 0 ? `/app/${remaining[0].id}` : "/app");
    },
  });

  const handleDelete = () => {
    if (noteId == null || !editor.note) return;
    const label = editor.note.title.trim() || "Untitled";
    if (
      !window.confirm(
        `Delete "${label}" permanently? This cannot be undone.`,
      )
    ) {
      return;
    }
    deleteMutation.mutate(noteId);
  };

  const notes = notesQuery.data ?? [];

  useEffect(() => {
    if (!noteId && notes.length > 0 && !notesQuery.isLoading) {
      navigate(`/app/${notes[0].id}`, { replace: true });
    }
  }, [noteId, notes, notesQuery.isLoading, navigate]);

  const showWorkspaceEmpty =
    !notesQuery.isLoading && !notesQuery.isError && notes.length === 0 && !filters.archived;

  useWorkspaceShortcuts({
    onSave: () => editor.saveNow(),
    onNewNote: handleCreateNote,
    onFocusSearch: focusSearch,
    enabled: !createMutation.isPending,
  });

  const shortcutHint = `${formatModShortcut("k")} search · ${formatModShortcut("s")} save · ${formatModShortcut("n", { shift: true })} new`;

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close note list"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <NoteSidebar
        notes={notes}
        activeNoteId={noteId}
        filters={filters}
        onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        isLoading={notesQuery.isLoading || notesQuery.isFetching}
        isCreating={createMutation.isPending}
        categories={categories}
        tags={tags}
        searchInputRef={searchInputRef}
        className={`fixed inset-y-0 left-0 z-30 w-72 transform transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      />

      <section className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 lg:hidden dark:border-slate-800">
          <Button variant="secondary" className="text-xs" onClick={() => setSidebarOpen(true)}>
            Notes
          </Button>
          <span className="text-xs text-slate-400">{shortcutHint}</span>
        </div>

        {notesQuery.isError ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState
              title="Could not load notes"
              description="Make sure the API is running, then refresh."
              action={
                <Button variant="secondary" onClick={() => notesQuery.refetch()}>
                  Retry
                </Button>
              }
            />
          </div>
        ) : showWorkspaceEmpty ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState
              title="No notes yet"
              description="Create your first note to start capturing ideas."
              action={
                <Button onClick={handleCreateNote} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating…" : "Create note"}
                </Button>
              }
            />
          </div>
        ) : (
          <NoteEditor
            noteId={noteId}
            draft={editor.draft}
            onDraftChange={editor.updateDraft}
            saveStatus={editor.saveStatus}
            note={editor.note}
            isLoading={noteId != null && editor.isLoading}
            isError={noteId != null && editor.isError}
            onArchive={handleArchive}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            onCreateNote={handleCreateNote}
            isCreating={createMutation.isPending}
            onSaveNow={() => editor.saveNow()}
          />
        )}
      </section>
    </div>
  );
}
