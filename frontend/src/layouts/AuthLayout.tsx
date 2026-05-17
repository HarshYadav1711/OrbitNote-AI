import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-md px-4 py-10">
        <Link to="/" className="text-lg font-bold text-brand-600">
          OrbitNote
        </Link>
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
