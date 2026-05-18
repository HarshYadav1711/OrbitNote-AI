import { useQuery } from "@tanstack/react-query";

export function useApiHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch("/api/health", { signal: controller.signal });
        if (!res.ok) throw new Error("API unhealthy");
        return res.json() as Promise<{ status: string }>;
      } finally {
        window.clearTimeout(timer);
      }
    },
    retry: false,
    refetchInterval: 15_000,
  });
}
