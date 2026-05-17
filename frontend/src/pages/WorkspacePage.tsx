import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";

export function WorkspacePage() {
  const queryClient = useQueryClient();
  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: api.notes,
  });

  const createMutation = useMutation({
    mutationFn: () => api.createNote({ title: "Untitled", content: "", tags: [] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  const notes = notesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Workspace</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Foundation shell with auth and core note records. Editor and advanced flows come next.
          </p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          New note
        </Button>
      </div>

      {notesQuery.isLoading ? <p className="text-sm text-slate-500">Loading notes...</p> : null}
      {notesQuery.isError ? (
        <p className="text-sm text-red-600">Could not load notes. Is the API running?</p>
      ) : null}

      {!notesQuery.isLoading && notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          description="Create a note to verify the API and database wiring."
          action={<Button onClick={() => createMutation.mutate()}>Create note</Button>}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="font-semibold">{note.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {note.content || "Empty note"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
