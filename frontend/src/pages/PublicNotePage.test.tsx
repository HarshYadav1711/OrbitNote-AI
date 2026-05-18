import { afterEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { PublicNotePage } from "./PublicNotePage";
import { renderWithProviders } from "../test/render";
import * as client from "../api/client";

describe("PublicNotePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading state while fetching a shared note", () => {
    vi.spyOn(client.api, "publicNote").mockReturnValue(new Promise(() => {}));

    renderWithProviders(
      <Routes>
        <Route path="/share/:token" element={<PublicNotePage />} />
      </Routes>,
      { router: { initialEntries: ["/share/demo-token"] } },
    );

    expect(screen.getByRole("status")).toHaveTextContent(/loading note/i);
  });

  it("shows an unavailable message when the share link fails", async () => {
    vi.spyOn(client.api, "publicNote").mockRejectedValue(new Error("Not found"));

    renderWithProviders(
      <Routes>
        <Route path="/share/:token" element={<PublicNotePage />} />
      </Routes>,
      { router: { initialEntries: ["/share/bad-token"] } },
    );

    expect(await screen.findByText("Note unavailable")).toBeInTheDocument();
    expect(
      screen.getByText(/link may have been revoked/i),
    ).toBeInTheDocument();
  });

  it("renders shared note content when the request succeeds", async () => {
    vi.spyOn(client.api, "publicNote").mockResolvedValue({
      title: "Shared doc",
      content: "Hello from OrbitNote",
      category: "work",
      tags: [{ id: 1, name: "demo" }],
      updated_at: "2025-01-02T12:00:00.000Z",
    });

    renderWithProviders(
      <Routes>
        <Route path="/share/:token" element={<PublicNotePage />} />
      </Routes>,
      { router: { initialEntries: ["/share/good-token"] } },
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Shared doc");
    });
    expect(screen.getByText("Hello from OrbitNote")).toBeInTheDocument();
    expect(screen.getByText("#demo")).toBeInTheDocument();
  });
});
