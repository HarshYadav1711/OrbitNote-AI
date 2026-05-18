import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { ThemeToggle } from "../components/ThemeToggle";

export function PublicNotePage() {
  const { token } = useParams();
  const shareToken = token ?? "";

  const noteQuery = useQuery({
    queryKey: ["public-note", shareToken],
    queryFn: () => api.publicNote(shareToken),
    enabled: Boolean(shareToken),
    retry: false,
  });

  const note = noteQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200/80 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-bold text-brand-600">
            OrbitNote
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">Shared note</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {noteQuery.isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner label="Loading note…" />
          </div>
        ) : noteQuery.isError || !note ? (
          <EmptyState
            title="Note unavailable"
            description="This link may have expired or the note is no longer shared publicly."
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
          <article>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {note.category ? (
                <span className="rounded-full bg-slate-200/80 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {note.category}
                </span>
              ) : null}
              {note.tags.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-brand-100 px-2.5 py-1 text-xs text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                >
                  #{t.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{note.title}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Last updated{" "}
              {new Date(note.updated_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>

            <div className="mt-8 whitespace-pre-wrap text-base leading-relaxed text-slate-800 dark:text-slate-200">
              {note.content.trim() || (
                <span className="text-slate-400">This note has no content.</span>
              )}
            </div>
          </article>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
        Shared with OrbitNote ·{" "}
        <Link to="/signup" className="text-brand-600 hover:underline dark:text-brand-400">
          Create your own notes
        </Link>
      </footer>
    </div>
  );
}
