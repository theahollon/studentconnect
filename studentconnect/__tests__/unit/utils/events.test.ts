// Unit tests for event database functions

import { getEventById, deleteEvent } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/client";

jest.mock("@/lib/supabase/client");

const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockDelete = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  (createClient as jest.Mock).mockReturnValue({
    from: mockFrom,
  });

  mockFrom.mockReturnValue({
    select: mockSelect,
    delete: mockDelete,
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    single: mockSingle,
  });
});

describe("getEventById", () => {
  test("returns event when found", async () => {
    const fakeEvent = { id: "1", title: "Test Event" };

    mockSingle.mockResolvedValueOnce({
      data: fakeEvent,
      error: null,
    });

    const result = await getEventById("1");

    expect(result).toEqual(fakeEvent);
  });

  test("returns null when not found", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { code: "PGRST116" },
    });

    const result = await getEventById("1");

    expect(result).toBeNull();
  });

  test("throws on unexpected error", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { code: "OTHER_ERROR", message: "Unexpected" },
    });

    await expect(getEventById("1")).rejects.toBeDefined();
  });
});

describe("deleteEvent", () => {
  test("deletes event successfully", async () => {
    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    await expect(deleteEvent("1")).resolves.toBeUndefined();
  });

  test("throws if supabase returns error", async () => {
    mockDelete.mockReturnValue({
      eq: jest.fn().mockResolvedValue({
        error: new Error("Delete failed"),
      }),
    });

    await expect(deleteEvent("1")).rejects.toThrow("Delete failed");
  });
});
