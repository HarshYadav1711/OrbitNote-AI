import type {
  AIGenerateResponse,
  AIHistoryEntry,
  DashboardData,
  Note,
  PublicNote,
  ShareLink,
  User,
} from "../types";
import { apiUrl } from "../lib/apiBase";
const DEFAULT_TIMEOUT_MS = 10_000;
const AI_TIMEOUT_MS = 90_000;

function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const rest = { ...options };
  delete rest.signal;

  return fetch(url, { ...rest, signal: controller.signal }).finally(() =>
    window.clearTimeout(timeoutId),
  );
}

export type NotesQueryParams = {
  q?: string;
  tag?: string;
  category?: string;
  archived?: boolean;
  sort?: "updated_desc" | "updated_asc";
};

export type NotePayload = {
  title?: string;
  content?: string;
  category?: string | null;
  tags?: string[];
  is_archived?: boolean;
};

export type AIGeneratePayload = {
  content?: string;
  title?: string;
  category?: string | null;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithTimeout(
      apiUrl(path),
      {
        credentials: auth ? "include" : "omit",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
        ...options,
      },
      timeoutMs,
    );
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        timeoutMs > DEFAULT_TIMEOUT_MS
          ? "AI request timed out. Ollama may be slow — try again in a moment."
          : "Could not reach the API. Is the backend running on port 8000?",
      );
    }
    throw new Error("Could not reach the API. Is the backend running on port 8000?");
  }

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

function notesQueryString(params?: NotesQueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.tag) search.set("tag", params.tag);
  if (params.category) search.set("category", params.category);
  if (params.archived) search.set("archived", "true");
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<User>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<User>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  /** Returns null when not logged in (401). Avoids treating guests as a query error. */
  me: async (): Promise<User | null> => {
    let res: Response;
    try {
      res = await fetchWithTimeout(apiUrl("/auth/me"), {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      throw new Error("Could not reach the API. Is the backend running on port 8000?");
    }
    if (res.status === 401) return null;
    if (!res.ok) {
      let detail = "Request failed";
      try {
        const body = await res.json();
        detail = body.detail ?? detail;
      } catch {
        /* ignore */
      }
      throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
    return res.json() as Promise<User>;
  },
  notes: (params?: NotesQueryParams) =>
    request<Note[]>(`/notes${notesQueryString(params)}`),
  getNote: (id: number) => request<Note>(`/notes/${id}`),
  createNote: (body: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
  }) => request<Note>("/notes", { method: "POST", body: JSON.stringify(body) }),
  updateNote: (id: number, body: NotePayload) =>
    request<Note>(`/notes/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteNote: (id: number) => request<void>(`/notes/${id}`, { method: "DELETE" }),
  generateSummary: (id: number, body?: AIGeneratePayload) =>
    request<AIGenerateResponse>(
      `/notes/${id}/ai/summary`,
      { method: "POST", body: JSON.stringify(body ?? {}) },
      true,
      AI_TIMEOUT_MS,
    ),
  extractActions: (id: number, body?: AIGeneratePayload) =>
    request<AIGenerateResponse>(
      `/notes/${id}/ai/actions`,
      { method: "POST", body: JSON.stringify(body ?? {}) },
      true,
      AI_TIMEOUT_MS,
    ),
  suggestTitle: (id: number, body?: AIGeneratePayload) =>
    request<AIGenerateResponse>(
      `/notes/${id}/ai/title`,
      { method: "POST", body: JSON.stringify(body ?? {}) },
      true,
      AI_TIMEOUT_MS,
    ),
  aiHistory: (id: number) => request<AIHistoryEntry[]>(`/notes/${id}/ai/history`),
  enableShare: (id: number) =>
    request<ShareLink>(`/notes/${id}/share`, { method: "POST" }),
  disableShare: (id: number) =>
    request<ShareLink>(`/notes/${id}/share`, { method: "DELETE" }),
  publicNote: (token: string) =>
    request<PublicNote>(`/public/notes/${token}`, {}, false),
  dashboard: () => request<DashboardData>("/analytics/dashboard"),
};
