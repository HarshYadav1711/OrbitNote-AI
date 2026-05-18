import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { NoteEditor } from "../components/NoteEditor";
import { NoteSidebar, type SidebarFilters } from "../components/NoteSidebar";
import { EmptyState } from "../components/EmptyState";
import { Button } from "../components/Button";
import { useDebounce } from "../hooks/useDebounce";
import { useNoteEditor } from "../hooks/useNoteEditor";
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

  const debouncedSearch = useDebounce(filters.search, 300);

  const notesQuery = useQuery({
    queryKey: ["notes", filters.archived, debouncedSearch, filters.tag, filters.category],
    queryFn: () =>
      api.notes({
        archived: filters.archived,
        q: debouncedSearch || undefined,
        tag: filters.tag || undefined,
        category: filters.category || undefined,
      }),
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
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      navigate(`/app/${note.id}`);
    },
  });

  const handleSelectNote = (id: number) => navigate(`/app/${id}`);

  const handleCreateNote = () => createMutation.mutate();

  const handleArchive = (archived: boolean) => {
    editor.archive(archived);
    if (archived) {
      navigate("/app");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  };

  const notes = notesQuery.data ?? [];

  useEffect(() => {
    if (!noteId && notes.length > 0 && !notesQuery.isLoading) {
      navigate(`/app/${notes[0].id}`, { replace: true });
    }
  }, [noteId, notes, notesQuery.isLoading, navigate]);

  const showWorkspaceEmpty =
    !notesQuery.isLoading && !notesQuery.isError && notes.length === 0 && !filters.archived;

  return (
    <div className="-mx-4 -my-6 flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <NoteSidebar
        notes={notes}
        activeNoteId={noteId}
        filters={filters}
        onFiltersChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
        isLoading={notesQuery.isLoading}
        isCreating={createMutation.isPending}
        categories={categories}
        tags={tags}
      />

      <section className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-950">
        {notesQuery.isError ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState
              title="Could not load notes"
              description="Make sure the API is running, then refresh."
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
            onCreateNote={handleCreateNote}
            isCreating={createMutation.isPending}
          />
        )}
      </section>
    </div>
  );
}
