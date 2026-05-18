import type { QueryClient } from "@tanstack/react-query";
import type { NotePayload } from "../api/client";
import type { Note } from "../types";

export type NotesCacheSnapshot = Array<[queryKey: readonly unknown[], data: Note[] | undefined]>;

export function isOptimisticNoteId(id: number | null): boolean {
  return id != null && id < 0;
}

export function applyNotePayload(note: Note, body: NotePayload): Note {
  return {
    ...note,
    title: body.title ?? note.title,
    content: body.content ?? note.content,
    category: body.category !== undefined ? body.category : note.category,
    is_archived: body.is_archived ?? note.is_archived,
    tags:
      body.tags !== undefined
        ? body.tags.map((name, index) => ({ id: -(index + 1), name }))
        : note.tags,
    updated_at: new Date().toISOString(),
  };
}

function notesListScope(queryKey: readonly unknown[]): "archived" | "active" | "other" {
  if (queryKey[1] === true) return "archived";
  if (queryKey[1] === false || queryKey[1] === "facets") return "active";
  return "other";
}

function upsertNoteInList(prev: Note[], updated: Note): Note[] {
  const index = prev.findIndex((n) => n.id === updated.id);
  if (index >= 0) {
    const next = [...prev];
    next[index] = updated;
    return next;
  }
  return [updated, ...prev];
}

function updateNotesList(prev: Note[] | undefined, queryKey: readonly unknown[], updated: Note) {
  if (!prev) return prev;

  const scope = notesListScope(queryKey);

  if (updated.is_archived) {
    if (scope === "archived") return upsertNoteInList(prev, updated);
    if (scope === "active") return prev.filter((n) => n.id !== updated.id);
    return prev;
  }

  if (scope === "archived") return prev.filter((n) => n.id !== updated.id);
  if (scope === "active") return upsertNoteInList(prev, updated);
  return prev;
}

export function patchNoteInCaches(queryClient: QueryClient, updated: Note) {
  queryClient.setQueryData(["note", updated.id], updated);
  for (const [key, prev] of queryClient.getQueriesData<Note[]>({ queryKey: ["notes"] })) {
    const next = updateNotesList(prev, key, updated);
    if (next !== prev) {
      queryClient.setQueryData(key, next);
    }
  }
}

export function prependNoteToActiveLists(queryClient: QueryClient, note: Note) {
  queryClient.setQueryData(["note", note.id], note);
  for (const [key, prev] of queryClient.getQueriesData<Note[]>({ queryKey: ["notes"] })) {
    if (key[1] === true || !prev) continue;
    queryClient.setQueryData(key, [note, ...prev]);
  }
}

export function findNoteInListCaches(queryClient: QueryClient, id: number): Note | undefined {
  for (const [, list] of queryClient.getQueriesData<Note[]>({ queryKey: ["notes"] })) {
    const found = list?.find((n) => n.id === id);
    if (found) return found;
  }
  return undefined;
}

export function snapshotNotesCaches(queryClient: QueryClient): NotesCacheSnapshot {
  return queryClient.getQueriesData<Note[]>({ queryKey: ["notes"] });
}

export function restoreNotesCaches(queryClient: QueryClient, snapshot: NotesCacheSnapshot) {
  for (const [key, data] of snapshot) {
    queryClient.setQueryData(key, data);
  }
}

export function snapshotNoteDetail(queryClient: QueryClient, id: number) {
  return queryClient.getQueryData<Note>(["note", id]);
}

export function restoreNoteDetail(queryClient: QueryClient, id: number, note: Note | undefined) {
  if (note !== undefined) {
    queryClient.setQueryData(["note", id], note);
    return;
  }
  queryClient.removeQueries({ queryKey: ["note", id] });
}

export function replaceTempNoteInCaches(queryClient: QueryClient, tempId: number, note: Note) {
  for (const [key, prev] of queryClient.getQueriesData<Note[]>({ queryKey: ["notes"] })) {
    if (!prev?.some((n) => n.id === tempId)) continue;
    queryClient.setQueryData(
      key,
      prev.map((n) => (n.id === tempId ? note : n)),
    );
  }
  queryClient.removeQueries({ queryKey: ["note", tempId] });
  queryClient.setQueryData(["note", note.id], note);
}
