import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api/client";
import { Button } from "./Button";
import type { Note } from "../types";

type Props = {
  note: Note;
};

export function ShareControls({ note }: Props) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    note.is_public && note.share_token
      ? `${window.location.origin}/share/${note.share_token}`
      : null;

  const enableMutation = useMutation({
    mutationFn: () => api.enableShare(note.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => api.disableShare(note.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const busy = enableMutation.isPending || disableMutation.isPending;

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Sharing
        </span>
        {note.is_public ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Public
          </span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Private
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {note.is_public
          ? "Anyone with the link can view this note. Editing still requires your account."
          : "Create a secure link to share a read-only copy of this note."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {note.is_public ? (
          <>
            <Button variant="secondary" className="text-xs" onClick={handleCopy} disabled={!shareUrl}>
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => disableMutation.mutate()}
              disabled={busy}
            >
              {busy ? "Updating…" : "Stop sharing"}
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => enableMutation.mutate()}
            disabled={busy || note.is_archived}
          >
            {busy ? "Enabling…" : "Create share link"}
          </Button>
        )}
      </div>

      {(enableMutation.isError || disableMutation.isError) && (
        <p className="mt-2 text-xs text-red-600">Could not update sharing. Try again.</p>
      )}
    </div>
  );
}
