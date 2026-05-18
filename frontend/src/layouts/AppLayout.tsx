import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { useUIStore } from "../store/uiStore";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive
      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
  }`;

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
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/app" className="text-lg font-bold text-brand-600">
              OrbitNote
            </Link>
            <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
              <NavLink to="/app" end className={navLinkClass}>
                Notes
              </NavLink>
              <NavLink to="/app/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
            </nav>
          </div>
          <nav className="flex items-center gap-2 text-sm sm:gap-3">
            <Button variant="ghost" onClick={toggleDarkMode} aria-pressed={darkMode}>
              {darkMode ? "Light" : "Dark"}
            </Button>
            <span className="hidden max-w-[8rem] truncate text-slate-500 sm:inline">{user?.name}</span>
            <Button variant="secondary" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? "Signing out…" : "Logout"}
            </Button>
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1 px-4 py-6 pb-20 sm:pb-6">
        <Outlet />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden dark:border-slate-800 dark:bg-slate-900/95"
        aria-label="Mobile"
      >
        <NavLink to="/app" end className={({ isActive }) => mobileNavClass(isActive)}>
          Notes
        </NavLink>
        <NavLink to="/app/dashboard" className={({ isActive }) => mobileNavClass(isActive)}>
          Dashboard
        </NavLink>
      </nav>
    </div>
  );
}

function mobileNavClass(isActive: boolean) {
  return `flex flex-1 items-center justify-center py-3 text-sm font-medium ${
    isActive ? "text-brand-600" : "text-slate-500"
  }`;
}
