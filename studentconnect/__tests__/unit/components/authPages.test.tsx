/**
 * Unit tests for auth page components.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// ── Mocks for server component pages ──────────────────────────────
jest.mock("server-only", () => ({}));
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn() }),
}));
jest.mock("@/lib/i18n/server", () => ({
  __esModule: true,
  getLocale: jest.fn().mockResolvedValue("en"),
  t: jest.fn((key: string) => Promise.resolve(key)),
}));

// ── Auth error page ───────────────────────────────────────────────
describe("auth/error page", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Page = require("@/app/auth/error/page").default;

  test("renders page with title", async () => {
    const searchParams = Promise.resolve({ error: "Token expired" });
    render(await Page({ searchParams }));
    expect(screen.getByText("auth.error.title")).toBeInTheDocument();
  });
});

// ── Auth sign-up-success page ─────────────────────────────────────
describe("auth/sign-up-success page", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Page = require("@/app/auth/sign-up-success/page").default;

  test("renders success card", async () => {
    render(await Page());
    expect(
      screen.getByText("auth.signUpSuccess.title"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("auth.signUpSuccess.body"),
    ).toBeInTheDocument();
  });
});
