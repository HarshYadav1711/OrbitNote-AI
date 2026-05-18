import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { Button } from "./Button";
import type { Note } from "../types";

type Props = {
  note: Note;
};

function formatSharedSince(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ShareControls({ note }: Props) {
  const queryClient = useQueryClient();
  const [shareUrl, setShareUrl] = useState<string | null>(
    note.is_public && note.share_token
      ? `${window.location.origin}/share/${note.share_token}`
      : null,
  );
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);

  useEffect(() => {
    setShareUrl(
      note.is_public && note.share_token
        ? `${window.location.origin}/share/${note.share_token}`
        : null,
    );
    if (note.is_public) setRevoked(false);
  }, [note.is_public, note.share_token]);

  const enableMutation = useMutation({
    mutationFn: () => api.enableShare(note.id),
    onSuccess: (link) => {
      setShareUrl(link.share_url ?? shareUrl);
      setRevoked(false);
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => api.disableShare(note.id),
    onSuccess: () => {
      setShareUrl(null);
      setRevoked(true);
      setCopied(false);
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const generating = enableMutation.isPending;
  const revoking = disableMutation.isPending;
  const busy = generating || revoking;
  const archived = note.is_archived;
  const isShared = note.is_public && Boolean(note.share_token);

  const handleCopy = async () => {
    if (!shareUrl || busy) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLabel = copied ? "Copied!" : "Copy link";
  const createLabel = generating ? "Generating…" : "Create share link";
  const stopLabel = revoking ? "Revoking…" : "Revoke link";

  const sharedSince = isShared ? formatSharedSince(note.updated_at) : null;

  return (
    <div
      className={`rounded-lg border p-3 ${
        isShared
          ? "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Sharing
        </span>
        {revoked && !isShared ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            Revoked
          </span>
        ) : isShared ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Shared
          </span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Private
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {isShared
          ? "Anyone with the link can view this note. Only you can edit it."
          : revoked
            ? "The previous link no longer works. Create a new one to share again."
            : "Create a link anyone can open—no account needed."}
      </p>

      {isShared && sharedSince ? (
        <p className="mt-1.5 text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
          Link active since {sharedSince}
        </p>
      ) : null}

      {archived ? (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          Restore this note to create or copy a share link.
        </p>
      ) : null}

      {isShared && shareUrl ? (
        <div className="mt-3">
          <label className="sr-only" htmlFor="share-url">
            Share link
          </label>
          <input
            id="share-url"
            type="text"
            readOnly
            value={shareUrl}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[11px] text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            onFocus={(e) => e.target.select()}
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {isShared ? (
          <>
            <Button
              variant="secondary"
              className="text-xs"
              onClick={handleCopy}
              disabled={!shareUrl || busy || archived}
              aria-live="polite"
            >
              {archived ? "Unavailable" : copyLabel}
            </Button>
            <Button
              variant="ghost"
              className="text-xs"
              onClick={() => disableMutation.mutate()}
              disabled={busy}
            >
              {stopLabel}
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            className="text-xs"
            onClick={() => enableMutation.mutate()}
            disabled={busy || archived}
          >
            {archived ? "Sharing disabled" : createLabel}
          </Button>
        )}
      </div>

      {(enableMutation.isError || disableMutation.isError) && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          Could not update sharing. Try again.
        </p>
      )}
    </div>
  );
}