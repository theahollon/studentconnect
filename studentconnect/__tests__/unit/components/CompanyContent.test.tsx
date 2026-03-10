/**
 * Unit tests for the CompanyContent server component.
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
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

// Database mocks
const mockGetCompanyByName = jest.fn();
const mockGetEventsByCompany = jest.fn();
const mockGetJobListingsByCompany = jest.fn();
const mockDeleteCompanyProfile = jest.fn();

jest.mock("@/lib/supabase/database", () => ({
  __esModule: true,
  getCompanyByName: (...args: unknown[]) => mockGetCompanyByName(...args),
  getEventsByCompany: (...args: unknown[]) => mockGetEventsByCompany(...args),
  getJobListingsByCompany: (...args: unknown[]) => mockGetJobListingsByCompany(...args),
  deleteCompanyProfile: (...args: unknown[]) => mockDeleteCompanyProfile(...args),
}));

// Supabase server mock (for isAdmin auth check)
const makeChain = (): Record<string, unknown> => {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.update = () => chain;
  chain.upsert = jest.fn().mockResolvedValue({ error: null });
  chain.insert = jest.fn().mockResolvedValue({ error: null });
  chain.delete = () => chain;
  // Default: non-admin user
  chain.single = jest.fn().mockResolvedValue({ data: { role: "user", email: "u@test.com" } });
  return chain;
};

const mockGetUser = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  __esModule: true,
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: () => makeChain(),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const CompanyContent = require("@/app/companies/[name]/CompanyContent").default;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
});

test("renders company name, description and website link", async () => {
  mockGetCompanyByName.mockResolvedValue({
    id: "c1",
    name: "Acme Corp",
    description: "Leading innovation",
    website_url: "https://acme.com",
  });
  mockGetEventsByCompany.mockResolvedValue([]);
  mockGetJobListingsByCompany.mockResolvedValue([]);

  const params = Promise.resolve({ name: "Acme%20Corp" });
  render(await CompanyContent({ params }));

  expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  expect(screen.getByText("Leading innovation")).toBeInTheDocument();
  expect(screen.getByText("companyDetail.visitWebsite")).toBeInTheDocument();
});

test("calls notFound when company does not exist", async () => {
  mockGetCompanyByName.mockResolvedValue(null);

  const params = Promise.resolve({ name: "nonexistent" });
  await expect(CompanyContent({ params })).rejects.toThrow("NEXT_NOT_FOUND");
});

test("renders events associated with the company", async () => {
  mockGetCompanyByName.mockResolvedValue({
    id: "c1",
    name: "Acme Corp",
    description: null,
    website_url: null,
  });
  mockGetEventsByCompany.mockResolvedValue([
    {
      id: "ev1",
      title: "Acme Meetup",
      description: "Networking event",
      start_time: "2026-06-15T10:00:00Z",
    },
  ]);
  mockGetJobListingsByCompany.mockResolvedValue([]);

  const params = Promise.resolve({ name: "Acme%20Corp" });
  render(await CompanyContent({ params }));

  expect(screen.getByText("Acme Meetup")).toBeInTheDocument();
  expect(screen.getByText("Networking event")).toBeInTheDocument();
});

test("renders job listings associated with the company", async () => {
  mockGetCompanyByName.mockResolvedValue({
    id: "c1",
    name: "Acme Corp",
    description: null,
    website_url: null,
  });
  mockGetEventsByCompany.mockResolvedValue([]);
  mockGetJobListingsByCompany.mockResolvedValue([
    {
      id: "j1",
      title: "Software Engineer",
      description: "Build cool stuff",
    },
  ]);

  const params = Promise.resolve({ name: "Acme%20Corp" });
  render(await CompanyContent({ params }));

  expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  expect(screen.getByText("Build cool stuff")).toBeInTheDocument();
});

test("shows empty-state text when no events or jobs", async () => {
  mockGetCompanyByName.mockResolvedValue({
    id: "c1",
    name: "Acme Corp",
    description: null,
    website_url: null,
  });
  mockGetEventsByCompany.mockResolvedValue([]);
  mockGetJobListingsByCompany.mockResolvedValue([]);

  const params = Promise.resolve({ name: "Acme%20Corp" });
  render(await CompanyContent({ params }));

  expect(screen.getByText("companyDetail.noEvents")).toBeInTheDocument();
  expect(screen.getByText("companyDetail.noJobListings")).toBeInTheDocument();
});

test("does not render description section when description is null", async () => {
  mockGetCompanyByName.mockResolvedValue({
    id: "c1",
    name: "Acme Corp",
    description: null,
    website_url: null,
  });
  mockGetEventsByCompany.mockResolvedValue([]);
  mockGetJobListingsByCompany.mockResolvedValue([]);

  const params = Promise.resolve({ name: "Acme%20Corp" });
  render(await CompanyContent({ params }));

  // The description heading should not appear
  expect(screen.queryByText("companyDetail.description")).not.toBeInTheDocument();
});

test("does not render website section when website_url is null", async () => {
  mockGetCompanyByName.mockResolvedValue({
    id: "c1",
    name: "Acme Corp",
    description: "Has description",
    website_url: null,
  });
  mockGetEventsByCompany.mockResolvedValue([]);
  mockGetJobListingsByCompany.mockResolvedValue([]);

  const params = Promise.resolve({ name: "Acme%20Corp" });
  render(await CompanyContent({ params }));

  expect(screen.queryByText("companyDetail.visitWebsite")).not.toBeInTheDocument();
});

test("truncates long event description to 100 chars", async () => {
  const longDesc = "A".repeat(150);
  mockGetCompanyByName.mockResolvedValue({
    id: "c1",
    name: "Acme Corp",
    description: null,
    website_url: null,
  });
  mockGetEventsByCompany.mockResolvedValue([
    { id: "ev1", title: "Long Event", description: longDesc, start_time: null },
  ]);
  mockGetJobListingsByCompany.mockResolvedValue([]);

  const params = Promise.resolve({ name: "Acme%20Corp" });
  render(await CompanyContent({ params }));

  // Should show first 100 chars + "..."
  expect(screen.getByText("A".repeat(100) + "...")).toBeInTheDocument();
});
