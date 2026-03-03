/**
 * Unit tests for the JobList component.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Translation stub returning English values for the keys the component uses
const translations: Record<string, string> = {
  "jobList.errorLoading": "Error loading job listings",
  "jobList.applicationDeadline": "Application deadline",
};

// Register mocks BEFORE importing the component so server-only / cookies never run
jest.mock("server-only", () => ({}));
jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn() }),
}));
jest.mock("@/lib/i18n/server", () => ({
  __esModule: true,
  getLocale: jest.fn().mockResolvedValue("en"),
  t: jest.fn((key: string) => Promise.resolve(translations[key] ?? key)),
}));
jest.mock("@/lib/supabase/database", () => ({
  __esModule: true,
  getJobListings: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getJobListings } = require("@/lib/supabase/database");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const JobList = require("@/app/joblistings/jobList").default;

test("renders job listings as links", async () => {
  getJobListings.mockResolvedValue([
    { id: "j1", title: "Frontend Dev", slug: "frontend-dev" },
    { id: "j2", title: "Backend Dev" },
  ]);

  render(await JobList());

  expect(screen.getByRole("button", { name: /Frontend Dev/i })).toHaveAttribute(
    "href",
    "/joblistings/frontend-dev",
  );
  expect(screen.getByRole("button", { name: /Backend Dev/i })).toHaveAttribute(
    "href",
    "/joblistings/j2",
  );
});

test("shows a readable error message", async () => {
  getJobListings.mockRejectedValue(new Error("Could not find the table"));
  render(await JobList());
  expect(
    screen.getByText(/Error loading job listings:/),
  ).toHaveTextContent("Could not find the table");
});