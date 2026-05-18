import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold text-brand-600">OrbitNote</span>
          <nav className="flex items-center gap-3 text-sm">
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : isAuthenticated ? (
              <Link to="/app">
                <Button>Open workspace</Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-300"
                >
                  Sign in
                </Link>
                <Link to="/signup">
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-600">
            Notes workspace
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Write, organize, and share with calm focus
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            OrbitNote combines a fast editor, optional local AI assist, public read-only links, and
            a productivity dashboard—without locking you into a cloud stack on day one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup">
              <Button className="px-5 py-2.5">Create account</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-5 py-2.5">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Autosave editor",
              body: "Categories, tags, and debounced saves keep your notes current without friction.",
            },
            {
              title: "Assist panel",
              body: "Summaries, action items, and titles via Ollama when available, with a reliable offline fallback.",
            },
            {
              title: "Public sharing",
              body: "Generate secure read-only links for collaborators—no account required to view.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
