import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type NotePayload } from "../api/client";
import type { Note } from "../types";

function patchNoteInCaches(queryClient: QueryClient, updated: Note) {
  queryClient.setQueryData(["note", updated.id], updated);
  queryClient.setQueriesData<Note[]>({ queryKey: ["notes"] }, (prev) =>
    prev?.map((n) => (n.id === updated.id ? updated : n)),
  );
}

function draftFromNote(note: Note): NoteDraft {
  return {
    title: note.title,
    content: note.content,
    category: note.category ?? "",
    tags: tagsToInput(note.tags),
  };
}

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

export type NoteDraft = {
  title: string;
  content: string;
  category: string;
  tags: string;
};

const AUTOSAVE_MS = 450;

function tagsFromInput(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsToInput(tags: { name: string }[]): string {
  return tags.map((t) => t.name).join(", ");
}

function draftToPayload(draft: NoteDraft): NotePayload {
  return {
    title: draft.title,
    content: draft.content,
    category: draft.category.trim() || null,
    tags: tagsFromInput(draft.tags),
  };
}

function isDraftDirty(draft: NoteDraft, note: Note): boolean {
  const payload = draftToPayload(draft);
  const noteTags = note.tags.map((t) => t.name).sort().join(",");
  const draftTags = [...(payload.tags ?? [])].sort().join(",");
  return (
    payload.title !== note.title ||
    payload.content !== note.content ||
    (payload.category ?? "") !== (note.category ?? "") ||
    draftTags !== noteTags
  );
}

export function useNoteEditor(noteId: number | null) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const skipSaveRef = useRef(true);
  const activeNoteIdRef = useRef(noteId);

  const noteQuery = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => api.getNote(noteId!),
    enabled: noteId != null,
  });

  useEffect(() => {
    activeNoteIdRef.current = noteId;
    skipSaveRef.current = true;
    setSaveStatus("idle");
    if (noteId == null) {
      setDraft(null);
    }
  }, [noteId]);

  useEffect(() => {
    if (!noteQuery.data) return;
    setDraft((current) => {
      if (current && isDraftDirty(current, noteQuery.data)) {
        return current;
      }
      return draftFromNote(noteQuery.data);
    });
    setSaveStatus("saved");
    skipSaveRef.current = true;
  }, [noteQuery.data]);

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: NotePayload }) => api.updateNote(id, body),
    onMutate: () => {
      if (activeNoteIdRef.current === noteId) {
        setSaveStatus("saving");
      }
    },
    onSuccess: (updated) => {
      if (activeNoteIdRef.current !== updated.id) return;
      patchNoteInCaches(queryClient, updated);
      setDraft(draftFromNote(updated));
      setSaveStatus("saved");
      skipSaveRef.current = true;
    },
    onError: () => {
      if (activeNoteIdRef.current === noteId) {
        setSaveStatus("error");
      }
    },
  });

  const saveNow = useCallback(() => {
    if (!noteId || !draft || !noteQuery.data) return;
    if (!isDraftDirty(draft, noteQuery.data)) {
      setSaveStatus("saved");
      return;
    }
    updateMutation.mutate({ id: noteId, body: draftToPayload(draft) });
  }, [noteId, draft, noteQuery.data, updateMutation]);

  useEffect(() => {
    if (!noteId || !draft || !noteQuery.data) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (!isDraftDirty(draft, noteQuery.data)) {
      setSaveStatus((s) => (s === "unsaved" || s === "error" ? "saved" : s));
      return;
    }
    setSaveStatus("unsaved");
    const timer = window.setTimeout(saveNow, AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, noteId, noteQuery.data, saveNow]);

  const updateDraft = useCallback((patch: Partial<NoteDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    skipSaveRef.current = false;
  }, []);

  const archive = useCallback(
    (archived: boolean) => {
      if (!noteId) return;
      updateMutation.mutate(
        { id: noteId, body: { is_archived: archived } },
        {
          onSuccess: (updated) => {
            patchNoteInCaches(queryClient, updated);
          },
        },
      );
    },
    [noteId, updateMutation, queryClient],
  );

  return {
    draft,
    updateDraft,
    saveStatus,
    saveNow,
    archive,
    isLoading: noteQuery.isLoading,
    isError: noteQuery.isError,
    note: noteQuery.data,
    isSaving: updateMutation.isPending,
  };
}
