import type { Note } from "../types";
import type { NoteDraft } from "../hooks/useNoteEditor";

export function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 1,
    title: "Weekly sync",
    content: "Discuss roadmap and blockers.",
    category: "work",
    is_archived: false,
    is_public: false,
    share_token: null,
    tags: [{ id: 1, name: "planning" }],
    created_at: "2025-01-01T12:00:00.000Z",
    updated_at: "2025-01-02T12:00:00.000Z",
    ...overrides,
  };
}

export function makeDraft(overrides: Partial<NoteDraft> = {}): NoteDraft {
  return {
    title: "Weekly sync",
    content: "Discuss roadmap and blockers.",
    category: "work",
    tags: "planning",
    ...overrides,
  };
}
