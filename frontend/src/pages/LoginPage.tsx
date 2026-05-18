import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, loginMutation, logoutMutation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await loginMutation.mutateAsync({ email, password });
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner label="Checking session…" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Already signed in</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          You have an active session as <strong>{user.name}</strong> ({user.email}). The browser
          keeps you logged in until you sign out — that is why you were not asked for a password.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate("/app")}>Go to workspace</Button>
          <Button
            variant="secondary"
            onClick={() =>
              logoutMutation.mutate(undefined, { onSuccess: () => navigate("/login") })
            }
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Sign in to your workspace.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Email</span>
          <Input
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            Password
          </span>
          <Input
            placeholder="Your password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        No account?{" "}
        <Link className="text-brand-600 dark:text-brand-400" to="/signup">
          Create one
        </Link>
      </p>
    </div>
  );
}
