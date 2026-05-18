import { useQuery } from "@tanstack/react-query";

import { apiUrl } from "../lib/apiBase";

export function useApiHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch(apiUrl("/health"), { signal: controller.signal });
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
