import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { useUIStore } from "../store/uiStore";

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logoutMutation } = useAuth();
  const { darkMode, toggleDarkMode } = useUIStore();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/login"),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link to="/app" className="text-lg font-bold text-brand-600">
              OrbitNote
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink
                to="/app"
                end
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`
                }
              >
                Notes
              </NavLink>
              <NavLink
                to="/app/dashboard"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`
                }
              >
                Dashboard
              </NavLink>
            </nav>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Button variant="ghost" onClick={toggleDarkMode}>
              {darkMode ? "Light" : "Dark"}
            </Button>
            <span className="hidden text-slate-500 sm:inline">{user?.name}</span>
            <Button variant="secondary" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? "Signing out…" : "Logout"}
            </Button>
          </nav>
        </div>
      </header>
      <main className="min-h-0 flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
