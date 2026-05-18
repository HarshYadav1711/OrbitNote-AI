/** API origin: `/api` in dev (Vite proxy) or absolute backend URL in production. */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE?.trim();
  if (!raw) return "/api";
  return raw.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBase()}${normalized}`;
}
