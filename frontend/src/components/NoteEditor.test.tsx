import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteEditor } from "./NoteEditor";
import { makeDraft, makeNote } from "../test/fixtures";
import { renderWithProviders } from "../test/render";

vi.mock("../hooks/useNoteAI", () => ({
  useNoteAI: () => ({
    summary: { status: "idle", data: null, provider: null, error: null },
    actions: { status: "idle", data: null, provider: null, error: null },
    title: { status: "idle", data: null, provider: null, error: null },
    showHistory: false,
    setShowHistory: vi.fn(),
    history: [],
    isHistoryLoading: false,
    generateSummary: vi.fn(),
    generateActions: vi.fn(),
    generateTitle: vi.fn(),
    isSummaryLoading: false,
    isActionsLoading: false,
    isTitleLoading: false,
    hasContent: true,
    reset: vi.fn(),
  }),
}));

const baseProps = {
  noteId: 1,
  onDraftChange: vi.fn(),
  saveStatus: "saved" as const,
  onArchive: vi.fn(),
  onDelete: vi.fn(),
  isDeleting: false,
  onCreateNote: vi.fn(),
  isCreating: false,
  onSaveNow: vi.fn(),
};

describe("NoteEditor", () => {
  it("shows a loading spinner while the note is loading", () => {
    renderWithProviders(
      <NoteEditor
        {...baseProps}
        draft={null}
        note={undefined}
        isLoading
        isError={false}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/loading note/i);
  });

  it("shows a not-found empty state when loading failed", () => {
    renderWithProviders(
      <NoteEditor
        {...baseProps}
        draft={null}
        note={undefined}
        isLoading={false}
        isError
      />,
    );

    expect(screen.getByText("Note not found")).toBeInTheDocument();
  });

  it("prompts the user to select a note when nothing is active", () => {
    renderWithProviders(
      <NoteEditor
        {...baseProps}
        noteId={null}
        draft={null}
        note={undefined}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText("Select a note")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new note/i })).toBeInTheDocument();
  });

  it("renders the editor when a note and draft are available", async () => {
    const onDraftChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <NoteEditor
        {...baseProps}
        draft={makeDraft()}
        note={makeNote()}
        isLoading={false}
        isError={false}
        onDraftChange={onDraftChange}
      />,
    );

    expect(screen.getByLabelText("Note title")).toHaveValue("Weekly sync");
    expect(screen.getByLabelText("Note content")).toHaveValue("Discuss roadmap and blockers.");
    expect(screen.getByText("Preview")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Note title"));
    await user.type(screen.getByLabelText("Note title"), "Sprint plan");

    expect(onDraftChange).toHaveBeenCalled();
  });
});
