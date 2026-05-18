import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, signupMutation, logoutMutation } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signupMutation.mutateAsync({ name, email, password });
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
          Signed in as <strong>{user.name}</strong>. Sign out first to create another account.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate("/app")}>Open notes</Button>
          <Button
            variant="secondary"
            onClick={() =>
              logoutMutation.mutate(undefined, { onSuccess: () => navigate("/signup") })
            }
          >
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Free to start. No credit card required.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Name</span>
          <Input
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Email</span>
          <Input
            placeholder="name@company.com"
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
            placeholder="At least 8 characters"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? "Creating…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link className="text-brand-600 dark:text-brand-400" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
