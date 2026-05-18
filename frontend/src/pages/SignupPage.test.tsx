import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupPage } from "./SignupPage";
import { renderWithProviders } from "../test/render";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => useAuthMock(),
}));

describe("SignupPage", () => {
  const signupMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };
  const logoutMutation = {
    mutate: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    signupMutation.mutateAsync.mockReset();
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      signupMutation,
      logoutMutation,
    });
  });

  it("requires a password of at least eight characters", () => {
    renderWithProviders(<SignupPage />);

    expect(screen.getByLabelText("Password")).toHaveAttribute("minLength", "8");
  });

  it("shows an error when signup fails", async () => {
    signupMutation.mutateAsync.mockRejectedValueOnce(new Error("Email already registered"));
    const user = userEvent.setup();

    renderWithProviders(<SignupPage />);

    await user.type(screen.getByLabelText("Name"), "Alex");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email already registered");
  });
});
