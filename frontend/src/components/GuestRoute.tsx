import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "./Spinner";
import { useAuth } from "../hooks/useAuth";

export function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
