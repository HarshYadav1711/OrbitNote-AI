import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { ApiError, ERROR_COPY, getErrorMessage } from "../lib/errors";
import { EmptyState } from "../components/EmptyState";
import { MarkdownPreview } from "../components/MarkdownPreview";
import { LoadingPlaceholder } from "../components/LoadingPlaceholder";
import { ThemeToggle } from "../components/ThemeToggle";

export function PublicNotePage() {
  const { token } = useParams();
  const shareToken = token ? decodeURIComponent(token) : "";

  const noteQuery = useQuery({
    queryKey: ["public-note", shareToken],
    queryFn: () => api.publicNote(shareToken),
    enabled: Boolean(shareToken),
    retry: false,
  });

  const note = noteQuery.data;

  function shareUnavailableMessage(): string {
    if (!shareToken.trim()) return ERROR_COPY.publicNoteInvalid;
    if (!noteQuery.isError) return ERROR_COPY.publicNoteInvalid;
    const err = noteQuery.error;
    if (err instanceof ApiError) {
      if (err.status === 404) return ERROR_COPY.publicNoteInvalid;
      if (err.status === 0) return getErrorMessage(err, ERROR_COPY.connection);
    }
    return ERROR_COPY.publicNoteInvalid;
  }

  return (
    <div className="public-note-page min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-bold text-brand-600">
            OrbitNote
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">
              Shared note · read only
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {noteQuery.isLoading ? (
          <LoadingPlaceholder label="Opening note…" className="py-20" />
        ) : !shareToken.trim() || noteQuery.isError || !note ? (
          <EmptyState
            title="Note unavailable"
            description={shareUnavailableMessage()}
            action={
              <Link
                to="/"
                className="inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Go to OrbitNote
              </Link>
            }
          />
        ) : (
          <article className="public-note-article">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Shared with OrbitNote
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
              {note.title}
            </h1>

            <section
              className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/40"
              aria-label="Note metadata"
            >
              <span className="text-slate-500 dark:text-slate-400">Last updated</span>
              <time
                dateTime={note.updated_at}
                className="font-medium text-slate-700 dark:text-slate-300"
              >
                {new Date(note.updated_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
              {note.category ? (
                <>
                  <span className="text-slate-300 dark:text-slate-600" aria-hidden>
                    ·
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {note.category}
                  </span>
                </>
              ) : null}
              {note.tags.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                >
                  #{t.name}
                </span>
              ))}
            </section>

            <div className="mt-8 sm:mt-10">
              {note.content.trim() ? (
                <MarkdownPreview
                  content={note.content}
                  className="public-note-content text-[17px] leading-[1.75] sm:text-lg"
                />
              ) : (
                <p className="text-sm italic text-slate-500 dark:text-slate-400">
                  {ERROR_COPY.publicNoteEmpty}
                </p>
              )}
            </div>
          </article>
        )}
      </main>

      <footer className="border-t border-slate-200 px-4 py-8 text-center dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Shared with <span className="font-medium text-slate-700 dark:text-slate-300">OrbitNote</span>
        </p>
        <p className="mt-2 text-xs text-slate-400">
          <Link to="/signup" className="text-brand-600 hover:underline dark:text-brand-400">
            Create an account
          </Link>
          {" · "}
          <Link to="/" className="hover:underline">
            Learn more
          </Link>
        </p>
      </footer>
    </div>
  );
}
