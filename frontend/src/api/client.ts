const API_BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
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

export const api = {
  signup: (body: { name: string; email: string; password: string }) =>
    request<import("../types").User>("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<import("../types").User>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<import("../types").User>("/auth/me"),
  notes: () => request<import("../types").Note[]>("/notes"),
  createNote: (body: { title: string; content: string; category?: string; tags?: string[] }) =>
    request<import("../types").Note>("/notes", { method: "POST", body: JSON.stringify(body) }),
};
