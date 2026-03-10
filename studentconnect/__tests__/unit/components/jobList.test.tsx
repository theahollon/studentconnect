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

  render(await JobList({}));

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
  render(await JobList({}));
  expect(
    screen.getByText(/Error loading job listings:/),
  ).toHaveTextContent("Could not find the table");
});

test("shows all job listings when no filter is applied", async () => {
  getJobListings.mockResolvedValue([
    { id: "j1", title: "Frontend Dev", employment_type: "fulltime" },
    { id: "j2", title: "Summer Intern", employment_type: "internship" },
  ]);

  render(await JobList({}));

  expect(screen.getByText("Frontend Dev")).toBeInTheDocument();
  expect(screen.getByText("Summer Intern")).toBeInTheDocument();
});

test("filters job listings by employment_type", async () => {
  getJobListings.mockResolvedValue([
    { id: "j1", title: "Frontend Dev", employment_type: "fulltime" },
    { id: "j2", title: "Summer Intern", employment_type: "internship" },
    { id: "j3", title: "Part Timer", employment_type: "parttime" },
  ]);

  render(await JobList({ filter: "fulltime" }));

  expect(screen.getByText("Frontend Dev")).toBeInTheDocument();
  expect(screen.queryByText("Summer Intern")).not.toBeInTheDocument();
  expect(screen.queryByText("Part Timer")).not.toBeInTheDocument();
});

test("shows no listings when filter matches nothing", async () => {
  getJobListings.mockResolvedValue([
    { id: "j1", title: "Frontend Dev", employment_type: "fulltime" },
  ]);

  render(await JobList({ filter: "internship" }));

  expect(screen.queryByText("Frontend Dev")).not.toBeInTheDocument();
});

test("renders all listings when filter is undefined", async () => {
  getJobListings.mockResolvedValue([
    { id: "j1", title: "Dev A", employment_type: "fulltime" },
    { id: "j2", title: "Dev B", employment_type: "temporary" },
  ]);

  render(await JobList({ filter: undefined }));

  expect(screen.getByText("Dev A")).toBeInTheDocument();
  expect(screen.getByText("Dev B")).toBeInTheDocument();
});
