/**
 * Unit tests for the EventsList component.
 *
 * Acknowledgement: Generated with AI assistance from GitHub Copilot.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Translation stub returning English values for the keys the component uses
const translations: Record<string, string> = {
  "eventsList.errorLoading": "Error loading events",
  "eventsList.upcoming": "Upcoming",
  "eventsList.dateLabel": "Date",
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
  getEvents: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getEvents } = require("@/lib/supabase/database");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EventsList = require("@/app/events/eventsList").default;

test("renders events as links", async () => {
  getEvents.mockResolvedValue([
    { id: "1", title: "Event A" },
    { id: "2", title: "Event B" },
  ]);

  render(await EventsList());

  expect(screen.getByRole("link", { name: /Event A/i })).toHaveAttribute(
    "href",
    "/events/1",
  );
  expect(screen.getByRole("link", { name: /Event B/i })).toHaveAttribute(
    "href",
    "/events/2",
  );
});

test("shows a readable error message", async () => {
  getEvents.mockRejectedValue(new Error("Invalid API key"));
  render(await EventsList());
  expect(screen.getByText(/Error loading events:/)).toHaveTextContent(
    "Invalid API key",
  );
});