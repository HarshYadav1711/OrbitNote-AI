import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type NotePayload } from "../api/client";
import {
  applyNotePayload,
  findNoteInListCaches,
  isOptimisticNoteId,
  patchNoteInCaches,
  restoreNoteDetail,
  restoreNotesCaches,
  snapshotNoteDetail,
  snapshotNotesCaches,
} from "../lib/noteCache";
import type { Note } from "../types";

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

type SaveVariables = { id: number; body: NotePayload; generation: number };

export function useNoteEditor(noteId: number | null) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<NoteDraft | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const skipSaveRef = useRef(true);
  const activeNoteIdRef = useRef(noteId);
  const draftRef = useRef<NoteDraft | null>(null);
  const saveGenerationRef = useRef(0);

  const noteQuery = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => api.getNote(noteId!),
    enabled: noteId != null && !isOptimisticNoteId(noteId),
  });

  const cachedNote =
    noteId != null && isOptimisticNoteId(noteId)
      ? queryClient.getQueryData<Note>(["note", noteId])
      : undefined;

  const note = noteQuery.data ?? cachedNote;

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    activeNoteIdRef.current = noteId;
    saveGenerationRef.current += 1;
    skipSaveRef.current = true;
    setSaveStatus("idle");
    if (noteId == null) {
      setDraft(null);
    }
  }, [noteId]);

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: SaveVariables) => api.updateNote(id, body),
    onMutate: async ({ id, body, generation }) => {
      if (generation !== saveGenerationRef.current) return;
      if (activeNoteIdRef.current === noteId) {
        setSaveStatus("saving");
      }

      await queryClient.cancelQueries({ queryKey: ["note", id] });
      await queryClient.cancelQueries({ queryKey: ["notes"] });

      const previousNote = snapshotNoteDetail(queryClient, id);
      const previousLists = snapshotNotesCaches(queryClient);
      const current = previousNote ?? findNoteInListCaches(queryClient, id);

      if (current) {
        patchNoteInCaches(queryClient, applyNotePayload(current, body));
      }

      return { previousNote, previousLists, generation };
    },
    onSuccess: (updated, { generation }) => {
      if (generation !== saveGenerationRef.current) return;
      if (activeNoteIdRef.current !== updated.id) return;

      patchNoteInCaches(queryClient, updated);

      let stillDirty = false;
      setDraft((current) => {
        if (!current) return draftFromNote(updated);
        stillDirty = isDraftDirty(current, updated);
        if (stillDirty) return current;
        return draftFromNote(updated);
      });

      if (stillDirty) {
        skipSaveRef.current = false;
        setSaveStatus("unsaved");
        return;
      }
      skipSaveRef.current = true;
      setSaveStatus("saved");
    },
    onError: (_err, { id, generation }, context) => {
      if (generation !== saveGenerationRef.current) return;
      if (!context) return;
      restoreNoteDetail(queryClient, id, context.previousNote);
      restoreNotesCaches(queryClient, context.previousLists);
      if (activeNoteIdRef.current === noteId) {
        setSaveStatus("error");
      }
    },
  });

  useEffect(() => {
    if (!note || updateMutation.isPending) return;
    setDraft((current) => {
      if (current && isDraftDirty(current, note)) {
        return current;
      }
      return draftFromNote(note);
    });
    setSaveStatus("saved");
    skipSaveRef.current = true;
  }, [note, updateMutation.isPending]);

  const saveNow = useCallback(() => {
    const currentDraft = draftRef.current;
    if (!noteId || isOptimisticNoteId(noteId) || !currentDraft || !note) return;
    if (updateMutation.isPending) return;
    if (!isDraftDirty(currentDraft, note)) {
      setSaveStatus("saved");
      return;
    }
    const generation = ++saveGenerationRef.current;
    updateMutation.mutate({
      id: noteId,
      body: draftToPayload(currentDraft),
      generation,
    });
  }, [noteId, note, updateMutation]);

  useEffect(() => {
    if (!noteId || isOptimisticNoteId(noteId) || !draft || !note) return;
    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }
    if (!isDraftDirty(draft, note)) {
      setSaveStatus((s) => (s === "unsaved" || s === "error" ? "saved" : s));
      return;
    }
    setSaveStatus("unsaved");
    const timer = window.setTimeout(saveNow, AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [draft, noteId, note, saveNow, updateMutation.isPending]);

  const updateDraft = useCallback((patch: Partial<NoteDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    skipSaveRef.current = false;
  }, []);

  const archive = useCallback(
    (archived: boolean) => {
      if (!noteId || isOptimisticNoteId(noteId)) return;
      const generation = ++saveGenerationRef.current;
      updateMutation.mutate({ id: noteId, body: { is_archived: archived }, generation });
    },
    [noteId, updateMutation],
  );

  return {
    draft,
    updateDraft,
    saveStatus,
    saveNow,
    archive,
    isLoading: noteId != null && !isOptimisticNoteId(noteId) && noteQuery.isLoading,
    isError: noteId != null && !isOptimisticNoteId(noteId) && noteQuery.isError,
    note,
    isSaving: updateMutation.isPending,
  };
}
