/**
 * Unit tests for uncovered database functions in lib/supabase/database.ts
 *
 * Covers: createEvent, getEvents, createJobListings, getJobListings,
 *         getUserProfile, updateUserProfile, getUserEventRegistrations,
 *         deleteEvent
 *
 * Acknowledgement: Created with AI assistance from GitHub Copilot.
 */

export {};

jest.mock(require.resolve("../../../lib/supabase/client"), () => {
  const mockFrom = jest.fn();

  return {
    createClient: () => ({ from: mockFrom }),
    __mocks__: { mockFrom },
  };
});

const {
  createEvent,
  getEvents,
  createJobListings,
  getJobListings,
  getEventReviews,
  getUserProfile,
  getUserEventReview,
  updateUserProfile,
  getUserEventRegistrations,
  deleteEvent,
} = require("../../../lib/supabase/database");

const clientModule = require("../../../lib/supabase/client");
const { mockFrom } = clientModule.__mocks__;

// ---- TESTS ----

describe("Database functions – uncovered paths", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---- createEvent ----
  describe("createEvent", () => {
    it("returns created event on success", async () => {
      const mockEvent = { id: "e1", title: "New Event" };
      mockFrom.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockEvent, error: null }),
          })),
        })),
      });

      const result = await createEvent({ title: "New Event" });

      expect(result).toEqual(mockEvent);
      expect(mockFrom).toHaveBeenCalledWith("events");
    });

    it("throws when insert fails", async () => {
      mockFrom.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: new Error("Insert failed") }),
          })),
        })),
      });

      await expect(createEvent({ title: "Bad" })).rejects.toThrow(
        "Insert failed"
      );
    });
  });

  // ---- getEvents ----
  describe("getEvents", () => {
    it("returns events list on success", async () => {
      const mockEvents = [
        { id: "e1", title: "Event 1" },
        { id: "e2", title: "Event 2" },
      ];
      mockFrom.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ data: mockEvents, error: null }),
      });

      const result = await getEvents();

      expect(result).toEqual(mockEvents);
      expect(mockFrom).toHaveBeenCalledWith("events");
    });

    it("throws on select error", async () => {
      mockFrom.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Select failed") }),
      });

      await expect(getEvents()).rejects.toThrow("Select failed");
    });
  });

  // ---- createJobListings ----
  describe("createJobListings", () => {
    it("returns created job on success", async () => {
      const mockJob = { id: "j1", title: "Developer" };
      mockFrom.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockJob, error: null }),
          })),
        })),
      });

      const result = await createJobListings({ title: "Developer" });

      expect(result).toEqual(mockJob);
      expect(mockFrom).toHaveBeenCalledWith("job_postings");
    });

    it("throws when insert fails", async () => {
      mockFrom.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: new Error("Insert failed") }),
          })),
        })),
      });

      await expect(createJobListings({ title: "Bad" })).rejects.toThrow(
        "Insert failed"
      );
    });
  });

  // ---- getJobListings ----
  describe("getJobListings", () => {
    it("returns job list on success", async () => {
      const mockJobs = [
        { id: "j1", title: "Job 1" },
        { id: "j2", title: "Job 2" },
      ];
      mockFrom.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ data: mockJobs, error: null }),
      });

      const result = await getJobListings();

      expect(result).toEqual(mockJobs);
      expect(mockFrom).toHaveBeenCalledWith("job_postings");
    });

    it("throws on select error", async () => {
      mockFrom.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error("Query failed") }),
      });

      await expect(getJobListings()).rejects.toThrow("Query failed");
    });
  });

  describe("getEventReviews", () => {
    it("returns event reviews on success", async () => {
      const mockReviews = [
        { id: "r1", rating: 5, comment: "Great" },
      ];
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn().mockResolvedValue({ data: mockReviews, error: null }),
          })),
        })),
      });

      const result = await getEventReviews("e1");

      expect(result).toEqual(mockReviews);
      expect(mockFrom).toHaveBeenCalledWith("event_reviews");
    });

    it("throws on review query error", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest
              .fn()
              .mockResolvedValue({ data: null, error: new Error("Review query failed") }),
          })),
        })),
      });

      await expect(getEventReviews("e1")).rejects.toThrow("Review query failed");
    });
  });

  // ---- getUserProfile ----
  describe("getUserProfile", () => {
    it("returns profile when found", async () => {
      const mockProfile = { id: "u1", full_name: "Alice" };
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockProfile, error: null }),
          })),
        })),
      });

      const result = await getUserProfile("u1");

      expect(result).toEqual(mockProfile);
      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });

    it("returns null when not found (PGRST116)", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
          })),
        })),
      });

      const result = await getUserProfile("missing");

      expect(result).toBeNull();
    });

    it("throws on non-PGRST116 error", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: new Error("DB error") }),
          })),
        })),
      });

      await expect(getUserProfile("u1")).rejects.toThrow("DB error");
    });
  });

  describe("getUserEventReview", () => {
    it("returns review when found", async () => {
      const mockReview = { id: "r1", event_id: "e1", user_id: "u1", rating: 5 };
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({ data: mockReview, error: null }),
            })),
          })),
        })),
      });

      const result = await getUserEventReview("e1", "u1");

      expect(result).toEqual(mockReview);
      expect(mockFrom).toHaveBeenCalledWith("event_reviews");
    });

    it("returns null when no review exists", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest
                .fn()
                .mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
            })),
          })),
        })),
      });

      await expect(getUserEventReview("e1", "u1")).resolves.toBeNull();
    });
  });

  // ---- updateUserProfile ----
  describe("updateUserProfile", () => {
    it("returns updated profile on success", async () => {
      const mockProfile = { id: "u1", full_name: "Bob" };
      mockFrom.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest
                .fn()
                .mockResolvedValue({ data: mockProfile, error: null }),
            })),
          })),
        })),
      });

      const result = await updateUserProfile("u1", { full_name: "Bob" });

      expect(result).toEqual(mockProfile);
      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });

    it("throws on update error", async () => {
      mockFrom.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest
                .fn()
                .mockResolvedValue({
                  data: null,
                  error: new Error("Update failed"),
                }),
            })),
          })),
        })),
      });

      await expect(
        updateUserProfile("u1", { full_name: "Bad" })
      ).rejects.toThrow("Update failed");
    });
  });

  // ---- getUserEventRegistrations ----
  describe("getUserEventRegistrations", () => {
    it("returns registrations on success", async () => {
      const mockRegs = [
        { id: "r1", event_id: "e1", user_id: "u1", events: { id: "e1" } },
      ];
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest
            .fn()
            .mockResolvedValue({ data: mockRegs, error: null }),
        })),
      });

      const result = await getUserEventRegistrations("u1");

      expect(result).toEqual(mockRegs);
      expect(mockFrom).toHaveBeenCalledWith("event_registration");
    });

    it("throws on query error", async () => {
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest
            .fn()
            .mockResolvedValue({ data: null, error: new Error("Query failed") }),
        })),
      });

      await expect(getUserEventRegistrations("u1")).rejects.toThrow(
        "Query failed"
      );
    });
  });

  // ---- deleteEvent ----
  describe("deleteEvent", () => {
    it("deletes successfully without error", async () => {
      mockFrom.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      });

      await expect(deleteEvent("e1")).resolves.toBeUndefined();
      expect(mockFrom).toHaveBeenCalledWith("events");
    });

    it("throws on delete error", async () => {
      mockFrom.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest
            .fn()
            .mockResolvedValue({ error: new Error("Delete failed") }),
        })),
      });

      await expect(deleteEvent("e1")).rejects.toThrow("Delete failed");
    });
  });
});
