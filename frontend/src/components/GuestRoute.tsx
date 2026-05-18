import { Outlet } from "react-router-dom";
import { Spinner } from "./Spinner";
import { useAuth } from "../hooks/useAuth";

export function GuestRoute() {
  const { isLoading, sessionError } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    );
  }

  return (
    <>
      {sessionError ? (
        <p
          className="mx-auto mb-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          role="status"
        >
          {sessionError} Run <code className="text-xs">npm run dev</code> from the repo root to start
          both servers.
        </p>
      ) : null}
      <Outlet />
    </>
  );
}
