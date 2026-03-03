/**
 * Unit tests for the auth wrapper pages (login, sign-up, forgot-password, update-password).
 * These are thin wrappers that just render form components.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/login-form", () => ({
  LoginForm: () => <div>MockLoginForm</div>,
}));
jest.mock("@/components/sign-up-form", () => ({
  SignUpForm: () => <div>MockSignUpForm</div>,
}));
jest.mock("@/components/forgot-password-form", () => ({
  ForgotPasswordForm: () => <div>MockForgotPasswordForm</div>,
}));
jest.mock("@/components/update-password-form", () => ({
  UpdatePasswordForm: () => <div>MockUpdatePasswordForm</div>,
}));

import LoginPage from "@/app/auth/login/page";
import SignUpPage from "@/app/auth/sign-up/page";
import ForgotPasswordPage from "@/app/auth/forgot-password/page";
import UpdatePasswordPage from "@/app/auth/update-password/page";

describe("Auth wrapper pages", () => {
  test("login page renders LoginForm", () => {
    render(<LoginPage />);
    expect(screen.getByText("MockLoginForm")).toBeInTheDocument();
  });

  test("sign-up page renders SignUpForm", () => {
    render(<SignUpPage />);
    expect(screen.getByText("MockSignUpForm")).toBeInTheDocument();
  });

  test("forgot-password page renders ForgotPasswordForm", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("MockForgotPasswordForm")).toBeInTheDocument();
  });

  test("update-password page renders UpdatePasswordForm", () => {
    render(<UpdatePasswordPage />);
    expect(screen.getByText("MockUpdatePasswordForm")).toBeInTheDocument();
  });
});
