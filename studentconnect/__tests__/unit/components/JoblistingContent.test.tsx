/**
 * Unit tests for the JoblistingContent server component.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

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
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

const mockGetJoblistingById = jest.fn();
jest.mock("@/lib/supabase/database", () => ({
  __esModule: true,
  getJoblistingById: (...args: unknown[]) => mockGetJoblistingById(...args),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const JoblistingContent =
  require("@/app/joblistings/[id]/JoblistingContent").default;

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders joblisting details", async () => {
  mockGetJoblistingById.mockResolvedValue({
    id: "j1",
    title: "Frontend Dev",
    description: "Build UIs",
    company: "Acme Corp",
  });

  const params = Promise.resolve({ id: "j1" });
  render(await JoblistingContent({ params }));

  expect(screen.getByText("Frontend Dev")).toBeInTheDocument();
  expect(screen.getByText("Build UIs")).toBeInTheDocument();
  expect(screen.getByText("Acme Corp")).toBeInTheDocument();
});

test("renders key info when location and deadline are present", async () => {
  mockGetJoblistingById.mockResolvedValue({
    id: "j1",
    title: "Backend Dev",
    description: "APIs",
    company: "Tech Inc",
    location: "Oslo",
    application_deadline: "2026-12-01",
    employment_type: "fulltime",
  });

  const params = Promise.resolve({ id: "j1" });
  render(await JoblistingContent({ params }));

  expect(screen.getByText("Oslo")).toBeInTheDocument();
  expect(
    screen.getByText("joblistingContent.keyInformation"),
  ).toBeInTheDocument();
});

test("renders apply button when application_url is set", async () => {
  mockGetJoblistingById.mockResolvedValue({
    id: "j1",
    title: "Designer",
    description: null,
    company: "Design Co",
    application_url: "https://apply.example.com",
    application_deadline: "2027-12-01",
  });

  const params = Promise.resolve({ id: "j1" });
  render(await JoblistingContent({ params }));

  expect(
    screen.getByText("joblistingContent.applyNow"),
  ).toBeInTheDocument();
});

test("calls notFound when joblisting does not exist", async () => {
  mockGetJoblistingById.mockResolvedValue(null);

  const params = Promise.resolve({ id: "missing" });
  await expect(JoblistingContent({ params })).rejects.toThrow(
    "NEXT_NOT_FOUND",
  );
});
