/**
 * Unit tests for the EventContent server component.
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
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("@/lib/i18n/client", () => ({
  t: (key: string) => key,
}));

const mockGetEventById = jest.fn();
const mockGetUser = jest.fn();
const mockSelect = jest.fn();

jest.mock("@/lib/supabase/database", () => ({
  __esModule: true,
  getEventById: (...args: unknown[]) => mockGetEventById(...args),
}));

// Build a flexible chainable mock that supports all Supabase query patterns
// used by EventContent and the auth helpers (isAdmin, requireAdmin).
const makeChain = (): Record<string, unknown> => {
  const chain: Record<string, unknown> = {};
  chain.select = () => chain;
  chain.eq = () => chain;
  chain.update = () => chain;
  chain.upsert = jest.fn().mockResolvedValue({ error: null });
  chain.insert = jest.fn().mockResolvedValue({ error: null });
  chain.delete = () => chain;
  // .single() used by isAdmin / requireAdmin for profile lookup → non-admin user
  chain.single = jest.fn().mockResolvedValue({ data: { role: "user", email: "u@test.com" } });
  // .maybeSingle() used by EventContent for registration check
  chain.maybeSingle = () => mockSelect();
  return chain;
};

jest.mock("@/lib/supabase/server", () => ({
  __esModule: true,
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: () => makeChain(),
  }),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const EventContent = require("@/app/events/[id]/EventContent").default;

beforeEach(() => {
  jest.clearAllMocks();
});

test("renders event details", async () => {
  mockGetEventById.mockResolvedValue({
    id: "e1",
    title: "Test Event",
    description: "A great event",
    start_time: "2026-06-15T10:00:00Z",
  });
  mockGetUser.mockResolvedValue({ data: { user: null } });

  const params = Promise.resolve({ id: "e1" });
  render(await EventContent({ params }));

  expect(screen.getByText("Test Event")).toBeInTheDocument();
  expect(screen.getByText("A great event")).toBeInTheDocument();
});

test("shows register button for logged-in user", async () => {
  mockGetEventById.mockResolvedValue({
    id: "e1",
    title: "Test Event",
    description: "Desc",
    start_time: "2026-06-15T10:00:00Z",
  });
  mockGetUser.mockResolvedValue({
    data: { user: { id: "u1" } },
  });
  mockSelect.mockResolvedValue({ data: null }); // not registered

  const params = Promise.resolve({ id: "e1" });
  render(await EventContent({ params }));

  expect(
    screen.getByText("eventContent.register"),
  ).toBeInTheDocument();
});

test("shows withdraw button when user is registered", async () => {
  mockGetEventById.mockResolvedValue({
    id: "e1",
    title: "Test Event",
    description: "Desc",
    start_time: "2026-06-15T10:00:00Z",
  });
  mockGetUser.mockResolvedValue({
    data: { user: { id: "u1" } },
  });
  mockSelect.mockResolvedValue({ data: { id: "reg1" } }); // registered

  const params = Promise.resolve({ id: "e1" });
  render(await EventContent({ params }));

  expect(
    screen.getByText("eventContent.withdraw"),
  ).toBeInTheDocument();
});

test("calls notFound when event does not exist", async () => {
  mockGetEventById.mockResolvedValue(null);

  const params = Promise.resolve({ id: "missing" });
  await expect(EventContent({ params })).rejects.toThrow("NEXT_NOT_FOUND");
});

test("renders event_type badge when event_type is set", async () => {
  mockGetEventById.mockResolvedValue({
    id: "e1",
    title: "Social Night",
    description: "Fun evening",
    start_time: "2026-06-15T10:00:00Z",
    event_type: "social",
  });
  mockGetUser.mockResolvedValue({ data: { user: null } });

  const params = Promise.resolve({ id: "e1" });
  render(await EventContent({ params }));

  expect(screen.getByText("social")).toBeInTheDocument();
});

test("does not render event_type badge when event_type is absent", async () => {
  mockGetEventById.mockResolvedValue({
    id: "e1",
    title: "Mystery Event",
    description: "No type",
    start_time: "2026-06-15T10:00:00Z",
    event_type: null,
  });
  mockGetUser.mockResolvedValue({ data: { user: null } });

  const params = Promise.resolve({ id: "e1" });
  render(await EventContent({ params }));

  expect(screen.queryByText("social")).not.toBeInTheDocument();
  expect(screen.queryByText("general")).not.toBeInTheDocument();
});
