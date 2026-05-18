import { useApiHealth } from "../hooks/useApiHealth";

export function ApiStatusBanner() {
  const health = useApiHealth();

  if (health.isPending || health.isSuccess) return null;

  return (
    <div
      className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-100"
      role="alert"
    >
      <strong>API offline.</strong> Start the backend in a second terminal:{" "}
      <code className="rounded bg-amber-100 px-1 text-xs dark:bg-amber-900">
        cd backend; .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
      </code>
      {" "}
      — or run <code className="text-xs">npm run dev</code> from the repo root for both servers.
    </div>
  );
}
