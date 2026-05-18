import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { renderWithProviders } from "../test/render";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ProtectedRoute", () => {
  it("shows a loading state while the session is resolving", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>Workspace</p>} />
        </Route>
      </Routes>,
      { router: { initialEntries: ["/app"] } },
    );

    expect(screen.getByRole("status")).toHaveTextContent(/checking session/i);
    expect(screen.queryByText("Workspace")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>Workspace</p>} />
        </Route>
      </Routes>,
      { router: { initialEntries: ["/app"] } },
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Workspace")).not.toBeInTheDocument();
  });

  it("renders child routes for authenticated users", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>Workspace</p>} />
        </Route>
      </Routes>,
      { router: { initialEntries: ["/app"] } },
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });
});
