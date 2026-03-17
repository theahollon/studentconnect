import {
  buildEventReviewSummary,
  canUserReviewEvent,
  getReviewerLabel,
  sanitizeReviewComment,
  validateEventReviewInput,
} from "@/lib/event-reviews";

describe("event review helpers", () => {
  test("sanitizes repeated whitespace", () => {
    expect(sanitizeReviewComment("  Great   event \n today  ")).toBe(
      "Great event today",
    );
  });

  test("validates accepted review input", () => {
    expect(() => validateEventReviewInput(5, "Useful and well organized")).not.toThrow();
  });

  test("rejects invalid review rating", () => {
    expect(() => validateEventReviewInput(6, "Too high")).toThrow(
      "Rating must be between 1 and 5.",
    );
  });

  test("rejects empty review comment", () => {
    expect(() => validateEventReviewInput(4, "   ")).toThrow(
      "Comment is required.",
    );
  });

  test("builds summary from reviews", () => {
    expect(
      buildEventReviewSummary([
        {
          id: "r1",
          event_id: "e1",
          user_id: "u1",
          rating: 4,
          comment: "Good",
          created_at: "2026-03-01T10:00:00Z",
          updated_at: "2026-03-01T10:00:00Z",
          profiles: { email: "one@example.com" },
        },
        {
          id: "r2",
          event_id: "e1",
          user_id: "u2",
          rating: 5,
          comment: "Great",
          created_at: "2026-03-02T10:00:00Z",
          updated_at: "2026-03-02T10:00:00Z",
          profiles: { email: "two@example.com" },
        },
      ]),
    ).toEqual({
      averageRating: 4.5,
      reviewCount: 2,
    });
  });

  test("only allows reviews for registered users after the event starts", () => {
    expect(
      canUserReviewEvent({
        hasUser: true,
        isRegistered: true,
        startTime: "2000-01-01T00:00:00Z",
      }),
    ).toBe(true);

    expect(
      canUserReviewEvent({
        hasUser: true,
        isRegistered: false,
        startTime: "2000-01-01T00:00:00Z",
      }),
    ).toBe(false);
  });

  test("derives reviewer label from email", () => {
    expect(
      getReviewerLabel({
        id: "r1",
        event_id: "e1",
        user_id: "u1",
        rating: 5,
        comment: "Nice",
        created_at: "2026-03-01T10:00:00Z",
        updated_at: "2026-03-01T10:00:00Z",
        profiles: { email: "reviewer@example.com" },
      }),
    ).toBe("reviewer");
  });
});
