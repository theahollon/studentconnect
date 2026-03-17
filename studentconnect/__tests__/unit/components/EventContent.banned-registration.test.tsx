// AI generated tests

/**
 * Extra unit tests for banned-user event registration behavior in
 * app/events/[id]/EventContent.tsx
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { TextEncoder, TextDecoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

const mockGetLocale = jest.fn().mockResolvedValue("en");
const mockT = jest.fn(async (key: string) => key);
jest.mock("@/lib/i18n/server", () => ({
  getLocale: () => mockGetLocale(),
  t: (key: string) => mockT(key),
}));

const mockIsAdmin = jest.fn().mockResolvedValue(false);
jest.mock("@/lib/auth", () => ({
  isAdmin: () => mockIsAdmin(),
}));

const mockGetEventById = jest.fn();
const mockGetEventReviews = jest.fn();
const mockGetUserEventReview = jest.fn();
jest.mock("@/lib/supabase/database", () => ({
  getEventById: (...args: unknown[]) => mockGetEventById(...args),
  getEventReviews: (...args: unknown[]) => mockGetEventReviews(...args),
  getUserEventReview: (...args: unknown[]) => mockGetUserEventReview(...args),
}));

jest.mock("@/app/events/[id]/DeleteEventButton", () => {
  return function DeleteEventButton() {
    return <div>DeleteEventButton</div>;
  };
});

const mockGetUser = jest.fn();
const mockRegistrationMaybeSingle = jest.fn();
const mockProfileMaybeSingle = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(async () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (table: string) => {
      if (table === "event_registrations") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => mockRegistrationMaybeSingle(),
              }),
            }),
          }),
        };
      }

      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => mockProfileMaybeSingle(),
            }),
          }),
        };
      }

      return {};
    },
  })),
}));

// Important: require AFTER TextEncoder/TextDecoder polyfill and mocks
// eslint-disable-next-line @typescript-eslint/no-require-imports
const EventContent = require("@/app/events/[id]/EventContent").default;

beforeEach(() => {
  jest.clearAllMocks();

  mockGetLocale.mockResolvedValue("en");
  mockT.mockImplementation(async (key: string) => key);
  mockIsAdmin.mockResolvedValue(false);

  mockGetEventById.mockResolvedValue({
    id: "event-1",
    title: "Test Event",
    description: "Event description",
    location: "Trondheim",
    start_time: "2026-03-20T12:00:00.000Z",
    event_type: "social",
  });
  mockGetEventReviews.mockResolvedValue([]);
  mockGetUserEventReview.mockResolvedValue(null);
});

describe("EventContent — banned registration behavior", () => {
  it("shows disabled register button and banned message for banned user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
    });
    mockRegistrationMaybeSingle.mockResolvedValue({ data: null });
    mockProfileMaybeSingle.mockResolvedValue({
      data: { banned_until: "2099-03-20T12:00:00.000Z" },
    });

    render(await EventContent({ params: Promise.resolve({ id: "event-1" }) }));

    const button = screen.getByText("eventContent.register").closest("button");
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByText("eventContent.bannedFromEvents")).toBeInTheDocument();
  });

  it("shows normal register button for non-banned user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
    });
    mockRegistrationMaybeSingle.mockResolvedValue({ data: null });
    mockProfileMaybeSingle.mockResolvedValue({
      data: { banned_until: null },
    });

    render(await EventContent({ params: Promise.resolve({ id: "event-1" }) }));

    const button = screen.getByText("eventContent.register").closest("button");
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(screen.queryByText("eventContent.bannedFromEvents")).not.toBeInTheDocument();
  });

  it("shows withdraw button for already registered banned user", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@test.com" } },
    });
    mockRegistrationMaybeSingle.mockResolvedValue({ data: { id: "reg-1" } });
    mockProfileMaybeSingle.mockResolvedValue({
      data: { banned_until: "2099-03-20T12:00:00.000Z" },
    });

    render(await EventContent({ params: Promise.resolve({ id: "event-1" }) }));

    expect(screen.getByText("eventContent.withdraw")).toBeInTheDocument();
    expect(screen.queryByText("eventContent.bannedFromEvents")).not.toBeInTheDocument();
  });

  it("does not render registration controls when no user is logged in", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    render(await EventContent({ params: Promise.resolve({ id: "event-1" }) }));

    expect(screen.queryByText("eventContent.register")).not.toBeInTheDocument();
    expect(screen.queryByText("eventContent.withdraw")).not.toBeInTheDocument();
  });

  it("renders delete button for admins", async () => {
    mockIsAdmin.mockResolvedValue(true);
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    render(await EventContent({ params: Promise.resolve({ id: "event-1" }) }));

    expect(screen.getByText("DeleteEventButton")).toBeInTheDocument();
  });
});
