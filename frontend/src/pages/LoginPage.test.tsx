import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "./LoginPage";
import { renderWithProviders } from "../test/render";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

describe("LoginPage", () => {
  const loginMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };
  const logoutMutation = {
    mutate: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    loginMutation.mutateAsync.mockReset();
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      loginMutation,
      logoutMutation,
    });
  });

  it("requires email and password before submit", () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText("Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
  });

  it("shows an error when credentials are rejected", async () => {
    loginMutation.mutateAsync.mockRejectedValueOnce(new Error("Invalid credentials"));
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
