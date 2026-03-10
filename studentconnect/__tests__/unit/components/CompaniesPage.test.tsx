/**
 * Unit tests for the CompaniesPage server component (admin/companies/page).
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Mocks required for server component environment
jest.mock("server-only", () => ({}));
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn() }),
}));
jest.mock("@/lib/i18n/server", () => ({
  __esModule: true,
  getLocale: jest.fn().mockResolvedValue("en"),
  t: jest.fn((key: string) => Promise.resolve(key)),
}));
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock auth
const mockIsAdmin = jest.fn();
jest.mock("@/lib/auth", () => ({
  __esModule: true,
  isAdmin: (...args: unknown[]) => mockIsAdmin(...args),
}));

// Mock CompanyList child component to avoid nested async component issues
jest.mock("@/app/admin/companies/companyList", () => ({
  __esModule: true,
  default: () => <div data-testid="company-list-mock">CompanyList</div>,
}));

// Supabase server mock
jest.mock("@/lib/supabase/server", () => ({
  __esModule: true,
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
    from: () => ({}),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const CompaniesPage = require("@/app/admin/companies/page").default;

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAdmin.mockResolvedValue(false);
});

test("renders page heading", async () => {
  render(await CompaniesPage());

  expect(screen.getByText("companiesPage.heading")).toBeInTheDocument();
});

test("renders CompanyList", async () => {
  render(await CompaniesPage());

  expect(screen.getByTestId("company-list-mock")).toBeInTheDocument();
});

test("shows create button for admin users", async () => {
  mockIsAdmin.mockResolvedValue(true);

  render(await CompaniesPage());

  expect(screen.getByText("companiesPage.createButton")).toBeInTheDocument();
});

test("hides create button for non-admin users", async () => {
  mockIsAdmin.mockResolvedValue(false);

  render(await CompaniesPage());

  expect(screen.queryByText("companiesPage.createButton")).not.toBeInTheDocument();
});

test("create button links to company form page", async () => {
  mockIsAdmin.mockResolvedValue(true);

  render(await CompaniesPage());

  const link = screen.getByText("companiesPage.createButton");
  expect(link.closest("a")).toHaveAttribute("href", "/admin/companies/companyForm");
});
