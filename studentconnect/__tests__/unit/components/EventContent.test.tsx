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
jest.mock("@/lib/supabase/server", () => ({
  __esModule: true,
  createClient: jest.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => mockSelect(),
          }),
        }),
      }),
    }),
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
