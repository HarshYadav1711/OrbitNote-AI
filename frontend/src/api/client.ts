import type {
  AIGenerateResponse,
  AIHistoryEntry,
  DashboardData,
  Note,
  PublicNote,
  ShareLink,
  User,
} from "../types";

const API_BASE = "/api";

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
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: auth ? "include" : "omit",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

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
  me: () => request<User>("/auth/me"),
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
  generateSummary: (id: number, body?: AIGeneratePayload) =>
    request<AIGenerateResponse>(`/notes/${id}/ai/summary`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),
  extractActions: (id: number, body?: AIGeneratePayload) =>
    request<AIGenerateResponse>(`/notes/${id}/ai/actions`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),
  suggestTitle: (id: number, body?: AIGeneratePayload) =>
    request<AIGenerateResponse>(`/notes/${id}/ai/title`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),
  aiHistory: (id: number) => request<AIHistoryEntry[]>(`/notes/${id}/ai/history`),
  enableShare: (id: number) =>
    request<ShareLink>(`/notes/${id}/share`, { method: "POST" }),
  disableShare: (id: number) =>
    request<ShareLink>(`/notes/${id}/share`, { method: "DELETE" }),
  publicNote: (token: string) =>
    request<PublicNote>(`/public/notes/${token}`, {}, false),
  dashboard: () => request<DashboardData>("/analytics/dashboard"),
};
