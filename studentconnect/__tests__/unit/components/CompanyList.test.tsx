/**
 * Unit tests for CompanyList and CompaniesPage server components.
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

// Database mocks
const mockGetCompanies = jest.fn();

jest.mock("@/lib/supabase/database", () => ({
  __esModule: true,
  getCompanies: (...args: unknown[]) => mockGetCompanies(...args),
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
const CompanyList = require("@/app/admin/companies/companyList").default;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CompanyList", () => {
  test("renders a list of company cards sorted alphabetically", async () => {
    mockGetCompanies.mockResolvedValue([
      { id: "c2", name: "Zebra Inc", description: "Second", website_url: null },
      { id: "c1", name: "Acme Corp", description: "First", website_url: "https://acme.com" },
    ]);

    render(await CompanyList());

    const names = screen.getAllByText(/Acme Corp|Zebra Inc/);
    expect(names[0]).toHaveTextContent("Acme Corp");
    expect(names[1]).toHaveTextContent("Zebra Inc");
  });

  test("shows company description truncated to 120 chars", async () => {
    const longDesc = "B".repeat(150);
    mockGetCompanies.mockResolvedValue([
      { id: "c1", name: "Acme", description: longDesc, website_url: null },
    ]);

    render(await CompanyList());

    expect(screen.getByText("B".repeat(120) + "...")).toBeInTheDocument();
  });

  test("shows website URL when present", async () => {
    mockGetCompanies.mockResolvedValue([
      { id: "c1", name: "Acme", description: null, website_url: "https://acme.com" },
    ]);

    render(await CompanyList());

    expect(screen.getByText("https://acme.com")).toBeInTheDocument();
  });

  test("renders error message when fetch fails", async () => {
    mockGetCompanies.mockRejectedValue(new Error("Network error"));

    render(await CompanyList());

    expect(screen.getByText(/companiesList.errorLoading/)).toBeInTheDocument();
    expect(screen.getByText(/Network error/)).toBeInTheDocument();
  });

  test("renders nothing for companies without an id", async () => {
    mockGetCompanies.mockResolvedValue([
      { id: null, name: "Ghost", description: null, website_url: null },
      { id: "c1", name: "Real Corp", description: null, website_url: null },
    ]);

    render(await CompanyList());

    expect(screen.queryByText("Ghost")).not.toBeInTheDocument();
    expect(screen.getByText("Real Corp")).toBeInTheDocument();
  });
});
