/** Shared user-facing copy for API and UI error states. */
export const ERROR_COPY = {
  connection:
    "Could not reach OrbitNote. Check your connection and try again.",
  aiTimeout: "Assist took too long. Try again in a moment.",
  requestFailed: "Something went wrong. Please try again.",
  noteNotFound: "This note may have been deleted or you don't have access.",
  notesLoadFailed: "We couldn't load your notes. Check your connection and try again.",
  dashboardLoadFailed: "We couldn't load your overview. Check your connection and try again.",
  publicNoteInvalid: "This link is invalid or sharing was turned off.",
  publicNoteEmpty: "This note has no content yet.",
  shareUpdateFailed: "Could not update sharing. Try again.",
  shareCopyFailed: "Could not copy the link. Copy it manually from the field above.",
  createNoteFailed: "Could not create a note. Try again.",
  deleteNoteFailed: "Could not delete this note. Try again.",
  aiFailed: "Assist could not complete this request. Try again.",
  aiHistoryFailed: "Could not load assist history.",
  aiUnexpected: "Assist returned an unexpected response. Try again.",
} as const;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type FastApiDetail =
  | string
  | { msg?: string; loc?: unknown[] }[]
  | Record<string, unknown>;

function formatDetail(detail: FastApiDetail): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String(item.msg);
        }
        return null;
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(". ");
  }
  return ERROR_COPY.requestFailed;
}

export function parseApiDetail(detail: unknown): string {
  if (detail == null) return ERROR_COPY.requestFailed;
  if (typeof detail === "string") return detail;
  return formatDetail(detail as FastApiDetail);
}

/** Normalize any thrown value to a user-facing message. */
export function getErrorMessage(err: unknown, fallback = ERROR_COPY.requestFailed): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
