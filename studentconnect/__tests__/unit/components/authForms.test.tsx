/**
 * Unit tests for auth form client components (login, sign-up, forgot-password, update-password).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock i18n client — passthrough keys
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
  getLocale: () => "en",
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Mock supabase client
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockUpdateUser = jest.fn();
const mockSignOut = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
  }),
}));

// Mock lib/utils
jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { LogoutButton } from "@/components/logout-button";

beforeEach(() => {
  jest.clearAllMocks();
});

// ── LoginForm ─────────────────────────────────────────────────────
describe("LoginForm", () => {
  test("renders login form fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("auth.login.email")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.login.password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "auth.login.submit" }),
    ).toBeInTheDocument();
  });

  test("handles successful login", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("auth.login.email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.login.password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "auth.login.submit" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
      expect(mockPush).toHaveBeenCalled();
    });
  });

  test("shows error on failed login", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: new Error("Invalid credentials"),
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("auth.login.email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.login.password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "auth.login.submit" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });
});

// ── SignUpForm ─────────────────────────────────────────────────────
describe("SignUpForm", () => {
  test("renders sign-up form fields", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText("auth.signUp.email")).toBeInTheDocument();
    expect(screen.getByLabelText("auth.signUp.password")).toBeInTheDocument();
    expect(
      screen.getByLabelText("auth.signUp.repeatPassword"),
    ).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText("auth.signUp.email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.signUp.password"), {
      target: { value: "abc" },
    });
    fireEvent.change(screen.getByLabelText("auth.signUp.repeatPassword"), {
      target: { value: "xyz" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.signUp.submit" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("auth.signUp.passwordsDoNotMatch"),
      ).toBeInTheDocument();
    });
  });

  test("handles successful sign-up", async () => {
    mockSignUp.mockResolvedValue({ error: null });

    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText("auth.signUp.email"), {
      target: { value: "new@test.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.signUp.password"), {
      target: { value: "pass123" },
    });
    fireEvent.change(screen.getByLabelText("auth.signUp.repeatPassword"), {
      target: { value: "pass123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.signUp.submit" }),
    );

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/auth/sign-up-success");
    });
  });

  test("shows error on failed sign-up", async () => {
    mockSignUp.mockResolvedValue({
      error: new Error("User already exists"),
    });

    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText("auth.signUp.email"), {
      target: { value: "dup@test.com" },
    });
    fireEvent.change(screen.getByLabelText("auth.signUp.password"), {
      target: { value: "pass" },
    });
    fireEvent.change(screen.getByLabelText("auth.signUp.repeatPassword"), {
      target: { value: "pass" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.signUp.submit" }),
    );

    await waitFor(() => {
      expect(screen.getByText("User already exists")).toBeInTheDocument();
    });
  });
});

// ── ForgotPasswordForm ────────────────────────────────────────────
describe("ForgotPasswordForm", () => {
  test("renders forgot password form", () => {
    render(<ForgotPasswordForm />);
    expect(
      screen.getByLabelText("auth.forgotPassword.email"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "auth.forgotPassword.submit" }),
    ).toBeInTheDocument();
  });

  test("shows success state after sending reset email", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("auth.forgotPassword.email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.forgotPassword.submit" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("auth.forgotPassword.successTitle"),
      ).toBeInTheDocument();
    });
  });

  test("shows error on failure", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: new Error("Rate limited"),
    });

    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("auth.forgotPassword.email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "auth.forgotPassword.submit" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Rate limited")).toBeInTheDocument();
    });
  });
});

// ── UpdatePasswordForm ────────────────────────────────────────────
describe("UpdatePasswordForm", () => {
  test("renders update password form", () => {
    render(<UpdatePasswordForm />);
    expect(
      screen.getByLabelText("auth.updatePassword.newPassword"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "auth.updatePassword.submit" }),
    ).toBeInTheDocument();
  });

  test("redirects on successful password update", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<UpdatePasswordForm />);
    fireEvent.change(
      screen.getByLabelText("auth.updatePassword.newPassword"),
      { target: { value: "newpass123" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "auth.updatePassword.submit" }),
    );

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: "newpass123" });
      expect(mockPush).toHaveBeenCalledWith("/protected");
    });
  });

  test("shows error on failure", async () => {
    mockUpdateUser.mockResolvedValue({
      error: new Error("Password too short"),
    });

    render(<UpdatePasswordForm />);
    fireEvent.change(
      screen.getByLabelText("auth.updatePassword.newPassword"),
      { target: { value: "x" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "auth.updatePassword.submit" }),
    );

    await waitFor(() => {
      expect(screen.getByText("Password too short")).toBeInTheDocument();
    });
  });
});

// ── LogoutButton ──────────────────────────────────────────────────
describe("LogoutButton", () => {
  test("renders logout button", () => {
    render(<LogoutButton />);
    expect(
      screen.getByText("auth.logoutButton.logout"),
    ).toBeInTheDocument();
  });

  test("signs out and redirects on click", async () => {
    mockSignOut.mockResolvedValue({});

    render(<LogoutButton />);
    fireEvent.click(screen.getByText("auth.logoutButton.logout"));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/auth/login");
    });
  });
});
