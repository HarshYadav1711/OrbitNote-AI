import { useApiHealth } from "../hooks/useApiHealth";

export function ApiStatusBanner() {
  const health = useApiHealth();

  if (health.isPending || health.isSuccess) return null;

  return (
    <div
      className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-100"
      role="alert"
    >
      <strong>Connection issue.</strong> OrbitNote can&apos;t reach the server right now. Check your
      network, then refresh the page.
    </div>
  );
}
