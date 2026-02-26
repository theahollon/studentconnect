//Ai generated tests:

export {};
// Match the exact mocking pattern used in joblistings.test.ts
jest.mock(require.resolve("../../../lib/supabase/client"), () => {
  const mockSingle = jest.fn();

  const mockEqSecond = jest.fn(() => ({ single: mockSingle }));
  const mockEqFirst = jest.fn(() => ({
    eq: mockEqSecond,
    single: mockSingle,
  }));

  const mockSelect = jest.fn(() => ({ eq: mockEqFirst }));

  const mockInsertSingle = jest.fn();
  const mockInsert = jest.fn(() => ({
    select: () => ({ single: mockInsertSingle }),
  }));

  const mockDeleteEqSecond = jest.fn().mockResolvedValue({ error: null });
  const mockDeleteEqFirst = jest.fn(() => ({ eq: mockDeleteEqSecond }));
  const mockDelete = jest.fn(() => ({ eq: mockDeleteEqFirst }));

  const mockFrom = jest.fn((table: string) => {
    if (table === "event_registration") {
      return {
        select: mockSelect,
        insert: mockInsert,
        delete: mockDelete,
      };
    }

    if (table === "events") {
      return {
        select: mockSelect,
      };
    }

    return {};
  });

  return {
    createClient: () => ({
      from: mockFrom,
    }),
    __mocks__: {
      mockFrom,
      mockSingle,
      mockEqFirst,
      mockEqSecond,
      mockDelete,
      mockDeleteEqFirst,
      mockDeleteEqSecond,
      mockInsert,
      mockInsertSingle,
    },
  };
});

const {
  isUserRegisteredForEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventById,
} = require("../../../lib/supabase/database");

const clientModule = require("../../../lib/supabase/client");
const mocks = clientModule.__mocks__;

describe("Event registration database functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("isUserRegisteredForEvent", () => {
    it("returns true when registration exists", async () => {
      mocks.mockSingle.mockResolvedValue({
        data: { id: "reg-1" },
        error: null,
      });

      const result = await isUserRegisteredForEvent("event-1", "user-1");

      expect(result).toBe(true);
      expect(mocks.mockFrom).toHaveBeenCalledWith("event_registration");
      expect(mocks.mockEqFirst).toHaveBeenCalledWith("event_id", "event-1");
      expect(mocks.mockEqSecond).toHaveBeenCalledWith("user_id", "user-1");
    });

    it("returns false when not found (PGRST116)", async () => {
      mocks.mockSingle.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const result = await isUserRegisteredForEvent("event-1", "user-1");

      expect(result).toBe(false);
    });
  });

  describe("registerForEvent", () => {
    it("inserts and returns registration", async () => {
      const mockReg = { id: "reg-1", event_id: "event-1", user_id: "user-1" };

      mocks.mockInsertSingle.mockResolvedValue({
        data: mockReg,
        error: null,
      });

      const result = await registerForEvent("event-1", "user-1");

      expect(result).toEqual(mockReg);
      expect(mocks.mockFrom).toHaveBeenCalledWith("event_registration");
      expect(mocks.mockInsert).toHaveBeenCalledWith({
        event_id: "event-1",
        user_id: "user-1",
      });
    });

    it("throws when insert fails", async () => {
      mocks.mockInsertSingle.mockResolvedValue({
        data: null,
        error: new Error("Insert failed"),
      });

      await expect(
        registerForEvent("event-1", "user-1")
      ).rejects.toThrow("Insert failed");
    });
  });

  describe("unregisterFromEvent", () => {
    it("calls delete correctly", async () => {
      await unregisterFromEvent("event-1", "user-1");

      expect(mocks.mockFrom).toHaveBeenCalledWith("event_registration");
      expect(mocks.mockDelete).toHaveBeenCalled();
    });
  });

  describe("getEventById", () => {
    it("returns event when found", async () => {
      const mockEvent = { id: "event-1", title: "Test" };

      mocks.mockSingle.mockResolvedValue({
        data: mockEvent,
        error: null,
      });

      const result = await getEventById("event-1");

      expect(result).toEqual(mockEvent);
      expect(mocks.mockFrom).toHaveBeenCalledWith("events");
      expect(mocks.mockEqFirst).toHaveBeenCalledWith("id", "event-1");
    });

    it("returns null when not found (PGRST116)", async () => {
      mocks.mockSingle.mockResolvedValue({
        data: null,
        error: { code: "PGRST116" },
      });

      const result = await getEventById("event-1");

      expect(result).toBeNull();
    });
  });
});