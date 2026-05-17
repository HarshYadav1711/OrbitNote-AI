import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { useUIStore } from "../store/uiStore";

export function AppLayout() {
  const { user, logoutMutation } = useAuth();
  const { darkMode, toggleDarkMode } = useUIStore();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/app" className="text-lg font-bold text-brand-600">
            OrbitNote
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/app"
              end
              className={({ isActive }) => (isActive ? "font-semibold text-brand-600" : "")}
            >
              Workspace
            </NavLink>
            <Button variant="ghost" onClick={toggleDarkMode}>
              {darkMode ? "Light" : "Dark"}
            </Button>
            <span className="text-slate-500">{user?.name}</span>
            <Button variant="secondary" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
