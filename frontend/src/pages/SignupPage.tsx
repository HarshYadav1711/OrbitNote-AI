import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";

export function SignupPage() {
  const navigate = useNavigate();
  const { signupMutation } = useAuth();
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Start with a local workspace—no credit card required.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Name</span>
          <Input
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-500">Email</span>
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
          <span className="mb-1 block text-xs font-medium text-slate-500">Password</span>
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
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="w-full" type="submit" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? "Creating..." : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link className="text-brand-600" to="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
