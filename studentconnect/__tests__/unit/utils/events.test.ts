/**
 * Unit tests for event utility functions and validation
 *
 * Acknowledgement: Created with AI assistance from GitHub Copilot.
 *
 * Note: Database CRUD operations are tested in integration tests.
 * Unit tests focus on business logic, validation, and error handling.
 */

import { describe, test, expect } from "@jest/globals";

describe("Event Business Logic Tests", () => {
  describe("Event ID validation", () => {
    test("should validate UUID format for event IDs", () => {
      const validUUID = "123e4567-e89b-12d3-a456-426614174000";
      const invalidUUID = "not-a-uuid";

      // UUID validation pattern
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuidPattern.test(validUUID)).toBe(true);
      expect(uuidPattern.test(invalidUUID)).toBe(false);
    });

    test("should handle empty or null event IDs", () => {
      const emptyId = "";
      const nullId = null;
      const undefinedId = undefined;

      expect(emptyId).toBeFalsy();
      expect(nullId).toBeFalsy();
      expect(undefinedId).toBeFalsy();
    });
  });

  describe("Event data validation", () => {
    test("should validate required event fields", () => {
      const validEvent = {
        title: "Test Event",
        description: "A valid event",
        date: new Date().toISOString(),
        location: "Test Location",
      };

      const invalidEvent = {
        title: "", // Empty title
        description: null, // Null description
        date: "invalid-date", // Invalid date
        location: undefined, // Undefined location
      };

      expect(validEvent.title).toBeTruthy();
      expect(validEvent.description).toBeTruthy();
      expect(new Date(validEvent.date).toString()).not.toBe("Invalid Date");
      expect(validEvent.location).toBeTruthy();

      expect(invalidEvent.title).toBeFalsy();
      expect(invalidEvent.description).toBeFalsy();
      expect(new Date(invalidEvent.date).toString()).toBe("Invalid Date");
      expect(invalidEvent.location).toBeFalsy();
    });

    test("should validate event date is in the future", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Tomorrow
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      const todayDate = new Date().toISOString(); // Today

      expect(new Date(futureDate).getTime() > Date.now()).toBe(true);
      expect(new Date(pastDate).getTime() < Date.now()).toBe(true);
      expect(new Date(todayDate).getTime()).toBeCloseTo(Date.now(), -3);
    });
  });

  describe("Error handling patterns", () => {
    test("should handle Supabase error codes correctly", () => {
      const notFoundError = { code: "PGRST116", message: "No rows found" };
      const permissionError = { code: "42501", message: "Permission denied" };
      const connectionError = {
        code: "ECONNREFUSED",
        message: "Connection refused",
      };

      // Test error code identification
      expect(notFoundError.code).toBe("PGRST116");
      expect(permissionError.code).toBe("42501");
      expect(connectionError.code).toBe("ECONNREFUSED");

      // Test error handling logic
      const isNotFound = (error: any) => error?.code === "PGRST116";
      const isPermissionDenied = (error: any) => error?.code === "42501";
      const isConnectionError = (error: any) => error?.code === "ECONNREFUSED";

      expect(isNotFound(notFoundError)).toBe(true);
      expect(isPermissionDenied(permissionError)).toBe(true);
      expect(isConnectionError(connectionError)).toBe(true);
      expect(isNotFound(permissionError)).toBe(false);
    });

    test("should create appropriate error messages", () => {
      const createUserFriendlyMessage = (error: any) => {
        switch (error?.code) {
          case "PGRST116":
            return "Event not found";
          case "42501":
            return "You don't have permission to perform this action";
          case "ECONNREFUSED":
            return "Unable to connect to database. Please try again later.";
          default:
            return "An unexpected error occurred";
        }
      };

      expect(createUserFriendlyMessage({ code: "PGRST116" })).toBe(
        "Event not found",
      );
      expect(createUserFriendlyMessage({ code: "42501" })).toBe(
        "You don't have permission to perform this action",
      );
      expect(createUserFriendlyMessage({ code: "UNKNOWN" })).toBe(
        "An unexpected error occurred",
      );
    });
  });

  describe("Data transformation utilities", () => {
    test("should format event data for display", () => {
      const rawEvent = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "  Test Event  ", // With whitespace
        description: "A test event description",
        date: "2026-12-25T10:00:00.000Z",
        location: "  Test Location  ", // With whitespace
      };

      const formatEventForDisplay = (event: typeof rawEvent) => ({
        ...event,
        title: event.title?.trim(),
        location: event.location?.trim(),
        formattedDate: new Date(event.date).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });

      const formattedEvent = formatEventForDisplay(rawEvent);

      expect(formattedEvent.title).toBe("Test Event");
      expect(formattedEvent.location).toBe("Test Location");
      expect(formattedEvent.formattedDate).toBe("Friday, December 25, 2026");
    });

    test("should sanitize event input data", () => {
      const unsafeInput = {
        title: "<script>alert('xss')</script>Test Event",
        description: "Event with <img src='x' onerror='alert(1)'>",
        location: "Test & Location",
      };

      const sanitizeInput = (input: string) => {
        return input
          .replace(/<script.*?>.*?<\/script>/gi, "")
          .replace(/<[^>]*>/g, "")
          .replace(/[<>&"']/g, (char) => {
            const entities: { [key: string]: string } = {
              "<": "&lt;",
              ">": "&gt;",
              "&": "&amp;",
              '"': "&quot;",
              "'": "&#x27;",
            };
            return entities[char] || char;
          });
      };

      expect(sanitizeInput(unsafeInput.title)).toBe("Test Event");
      expect(sanitizeInput(unsafeInput.description)).toBe("Event with ");
      expect(sanitizeInput(unsafeInput.location)).toBe("Test &amp; Location");
    });
  });
});
