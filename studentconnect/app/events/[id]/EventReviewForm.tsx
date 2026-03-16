"use client";

import { useActionState, useEffect, useState } from "react";
import { t } from "@/lib/i18n/client";

type ReviewFormState = {
  success: boolean;
  error: string | null;
};

interface EventReviewFormProps {
  submitAction: (
    state: ReviewFormState,
    formData: FormData,
  ) => Promise<ReviewFormState>;
  initialRating?: number | null;
  initialComment?: string | null;
  maxCommentLength: number;
}

const initialState: ReviewFormState = {
  success: false,
  error: null,
};

export default function EventReviewForm({
  submitAction,
  initialRating,
  initialComment,
  maxCommentLength,
}: EventReviewFormProps) {
  const [state, formAction, pending] = useActionState(submitAction, initialState);
  const [rating, setRating] = useState<string>(initialRating ? String(initialRating) : "");
  const [comment, setComment] = useState(initialComment ?? "");
  const charactersText = t("eventReviewForm.characters").replace(
    "{{count}}",
    String(maxCommentLength),
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setRating("");
    setComment("");
  }, [state.success]);

  return (
    <form action={formAction} className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
      <fieldset>
        <legend className="text-sm font-medium text-gray-900">
          {t("eventReviewForm.yourRating")}
        </legend>
        <div className="mt-3 flex gap-3">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            >
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === String(value)}
                onChange={(event) => setRating(event.target.value)}
                required
              />
              <span>{value} star{value === 1 ? "" : "s"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4">
        <label
          htmlFor="comment"
          className="text-sm font-medium text-gray-900"
        >
          {t("eventReviewForm.comment")}
        </label>
        <textarea
          id="comment"
          name="comment"
          required
          maxLength={maxCommentLength}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          className="mt-2 min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
        <p className="mt-2 text-xs text-gray-500">
          {charactersText}
        </p>
      </div>

      {state.error && (
        <p className="mt-3 text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? t("eventReviewForm.submitting") : t("eventReviewForm.submit")}
      </button>
    </form>
  );
}
