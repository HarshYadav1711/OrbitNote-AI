import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { api, type AIGeneratePayload } from "../api/client";
import type {
  AIActionsResult,
  AIGenerateResponse,
  AISummaryResult,
  AITitleResult,
} from "../types";

export type AIFeature = "summary" | "actions" | "title";
export type AIJobStatus = "idle" | "loading" | "success" | "error";

type FeatureState<T> = {
  status: AIJobStatus;
  data: T | null;
  provider: string | null;
  error: string | null;
};

const emptyFeature = <T>(): FeatureState<T> => ({
  status: "idle",
  data: null,
  provider: null,
  error: null,
});

function isSummary(r: AIGenerateResponse["result"]): r is AISummaryResult {
  return "summary" in r;
}

function isActions(r: AIGenerateResponse["result"]): r is AIActionsResult {
  return "items" in r;
}

function isTitle(r: AIGenerateResponse["result"]): r is AITitleResult {
  return "title" in r && !("summary" in r) && !("items" in r);
}

export function useNoteAI(
  noteId: number | null,
  draft: { content: string; title: string } | null,
) {
  const queryClient = useQueryClient();
  const [summary, setSummary] = useState(() => emptyFeature<AISummaryResult>());
  const [actions, setActions] = useState(() => emptyFeature<AIActionsResult>());
  const [title, setTitle] = useState(() => emptyFeature<AITitleResult>());
  const [showHistory, setShowHistory] = useState(false);

  const payload = (): AIGeneratePayload | undefined => {
    if (!draft) return undefined;
    return { content: draft.content, title: draft.title };
  };

  const historyQuery = useQuery({
    queryKey: ["ai-history", noteId],
    queryFn: () => api.aiHistory(noteId!),
    enabled: noteId != null && showHistory,
  });

  const invalidateHistory = useCallback(() => {
    if (noteId != null) {
      queryClient.invalidateQueries({ queryKey: ["ai-history", noteId] });
    }
  }, [noteId, queryClient]);

  const summaryMutation = useMutation({
    mutationFn: () => api.generateSummary(noteId!, payload()),
    onMutate: () => setSummary((s) => ({ ...s, status: "loading", error: null })),
    onSuccess: (res) => {
      if (!isSummary(res.result)) return;
      setSummary({
        status: "success",
        data: res.result,
        provider: res.provider,
        error: null,
      });
      invalidateHistory();
    },
    onError: (err: Error) =>
      setSummary((s) => ({ ...s, status: "error", error: err.message })),
  });

  const actionsMutation = useMutation({
    mutationFn: () => api.extractActions(noteId!, payload()),
    onMutate: () => setActions((s) => ({ ...s, status: "loading", error: null })),
    onSuccess: (res) => {
      if (!isActions(res.result)) return;
      setActions({
        status: "success",
        data: res.result,
        provider: res.provider,
        error: null,
      });
      invalidateHistory();
    },
    onError: (err: Error) =>
      setActions((s) => ({ ...s, status: "error", error: err.message })),
  });

  const titleMutation = useMutation({
    mutationFn: () => api.suggestTitle(noteId!, payload()),
    onMutate: () => setTitle((s) => ({ ...s, status: "loading", error: null })),
    onSuccess: (res) => {
      if (!isTitle(res.result)) return;
      setTitle({
        status: "success",
        data: res.result,
        provider: res.provider,
        error: null,
      });
      invalidateHistory();
    },
    onError: (err: Error) =>
      setTitle((s) => ({ ...s, status: "error", error: err.message })),
  });

  const reset = useCallback(() => {
    setSummary(emptyFeature());
    setActions(emptyFeature());
    setTitle(emptyFeature());
    setShowHistory(false);
  }, []);

  useEffect(() => {
    reset();
  }, [noteId, reset]);

  const hasContent = Boolean(draft?.content.trim());

  return {
    summary,
    actions,
    title,
    showHistory,
    setShowHistory,
    history: historyQuery.data ?? [],
    isHistoryLoading: historyQuery.isLoading,
    generateSummary: () => noteId && hasContent && summaryMutation.mutate(),
    generateActions: () => noteId && hasContent && actionsMutation.mutate(),
    generateTitle: () => noteId && hasContent && titleMutation.mutate(),
    isSummaryLoading: summaryMutation.isPending,
    isActionsLoading: actionsMutation.isPending,
    isTitleLoading: titleMutation.isPending,
    hasContent,
    reset,
  };
}
