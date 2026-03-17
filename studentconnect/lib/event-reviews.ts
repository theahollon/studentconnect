import type { event_review_with_profile } from "@/lib/supabase/types";

export const EVENT_REVIEW_MIN_RATING = 1;
export const EVENT_REVIEW_MAX_RATING = 5;
export const EVENT_REVIEW_MAX_COMMENT_LENGTH = 500;

export interface EventReviewSummary {
  averageRating: number;
  reviewCount: number;
}

export function sanitizeReviewComment(comment: string): string {
  return comment.trim().replace(/\s+/g, " ");
}

export function validateEventReviewInput(rating: number, comment: string): void {
  if (!Number.isInteger(rating)) {
    throw new Error("Rating must be an integer.");
  }

  if (rating < EVENT_REVIEW_MIN_RATING || rating > EVENT_REVIEW_MAX_RATING) {
    throw new Error("Rating must be between 1 and 5.");
  }

  if (!comment.trim()) {
    throw new Error("Comment is required.");
  }

  if (sanitizeReviewComment(comment).length > EVENT_REVIEW_MAX_COMMENT_LENGTH) {
    throw new Error("Comment is too long.");
  }
}

export function buildEventReviewSummary(
  reviews: event_review_with_profile[],
): EventReviewSummary {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: Math.round((total / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

export function canUserReviewEvent(params: {
  hasUser: boolean;
  isRegistered: boolean;
  startTime: string | null | undefined;
}): boolean {
  if (!params.hasUser || !params.isRegistered || !params.startTime) {
    return false;
  }

  return new Date(params.startTime).getTime() <= Date.now();
}

export function getReviewerLabel(review: event_review_with_profile): string {
  const email = review.profiles?.email?.trim();
  if (!email) {
    return "Student";
  }

  return email.split("@")[0] || "Student";
}
