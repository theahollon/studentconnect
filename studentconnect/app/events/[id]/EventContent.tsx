import {
  getEventById,
  getEventReviews,
  getUserEventReview,
} from "@/lib/supabase/database";
import { notFound } from "next/navigation";
import DeleteEventButton from "./DeleteEventButton";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getLocale, t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";
import {
  buildEventReviewSummary,
  canUserReviewEvent,
  EVENT_REVIEW_MAX_COMMENT_LENGTH,
  getReviewerLabel,
  sanitizeReviewComment,
  validateEventReviewInput,
} from "@/lib/event-reviews";
import EventReviewForm from "./EventReviewForm";

export default async function EventContent(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const eventData = await getEventById(id);
  if (!eventData) return notFound();

  const event = eventData;

  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isRegistered = false;
  let isBannedFromEvents = false;
  let currentUserReview = null;

  const reviewsPromise = getEventReviews(event.id);

  if (user) {
    const [{ data: registration }, { data: profile }, userReview] = await Promise.all([
      supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("banned_until")
        .eq("id", user.id)
        .maybeSingle(),
      getUserEventReview(event.id, user.id),
    ]);

    isRegistered = !!registration;
    currentUserReview = userReview;

    if (profile?.banned_until) {
      isBannedFromEvents = new Date(profile.banned_until).getTime() > Date.now();
    }
  }

  const reviews = await reviewsPromise;
  const reviewSummary = buildEventReviewSummary(reviews);
  const canReview = canUserReviewEvent({
    hasUser: !!user,
    isRegistered,
    startTime: event.start_time,
  });

  async function register() {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("banned_until")
      .eq("id", user.id)
      .maybeSingle();

    const isBanned =
      !!profile?.banned_until &&
      new Date(profile.banned_until).getTime() > Date.now();

    if (isBanned) {
      return;
    }

    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      user_id: user.id,
    });

    if (error) throw error;

    revalidatePath(`/events/${event.id}`);
  }

  async function submitReview(
    _state: { success: boolean; error: string | null },
    formData: FormData,
  ) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: await t("eventContent.reviewErrorLogin"),
      };
    }

    const { data: registration } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!registration) {
      return {
        success: false,
        error: await t("eventContent.reviewErrorRegistered"),
      };
    }

    if (!canUserReviewEvent({ hasUser: true, isRegistered: true, startTime: event.start_time })) {
      return {
        success: false,
        error: await t("eventContent.reviewErrorAfterStart"),
      };
    }

    const rawRating = Number(formData.get("rating"));
    const rawComment = String(formData.get("comment") ?? "");
    const comment = sanitizeReviewComment(rawComment);

    try {
      validateEventReviewInput(rawRating, comment);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : await t("eventContent.reviewErrorInvalid"),
      };
    }

    const { error } = await supabase.from("event_reviews").upsert(
      {
        event_id: event.id,
        user_id: user.id,
        rating: rawRating,
        comment,
      },
      { onConflict: "event_id,user_id" },
    );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath(`/events/${event.id}`);

    return {
      success: true,
      error: null,
    };
  }

  async function withdraw() {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", event.id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath(`/events/${event.id}`);
  }

  const registerText = await t("eventContent.register");
  const withdrawText = await t("eventContent.withdraw");
  const bannedMessage = await t("eventContent.bannedFromEvents");
  const reviewSectionTitle = await t("eventContent.reviewSectionTitle");
  const noReviewsText = await t("eventContent.noReviews");
  const reviewRequiresAttendanceText = await t("eventContent.reviewRequiresAttendance");
  const reviewLoginPromptText = await t("eventContent.reviewLoginPrompt");
  const registeredInfoText = await t("eventContent.registeredInfo");
  const joinPromptText = await t("eventContent.joinPrompt");
  const eventTypeText = event.event_type
    ? await t(`activityForm.categories.${event.event_type}`)
    : null;
  const admin = await isAdmin();

  const showDisabledRegister = user && !isRegistered && isBannedFromEvents;

  return (
    <div className="space-y-8 p-8 md:p-10">
      <header className="rounded-[28px] border border-white/50 bg-white/55 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            {event.event_type && (
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 ring-1 ring-black/5">
                {eventTypeText}
              </span>
            )}

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl">
              {event.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-amber-100">
                {new Date(event.start_time).toLocaleString(dateLocale)}
              </span>
              {event.location && (
                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 ring-1 ring-black/5">
                  {event.location}
                </span>
              )}
              {reviewSummary.reviewCount > 0 && (
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-black/5">
                  ★ {reviewSummary.averageRating}/5 ({reviewSummary.reviewCount})
                </span>
              )}
            </div>
          </div>

          {user && (
            <div className="md:min-w-[220px]">
              {showDisabledRegister ? (
                <div className="flex flex-col items-start gap-2 rounded-2xl bg-white/70 p-4 ring-1 ring-red-100">
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed rounded-full bg-gray-300 px-4 py-2 text-white opacity-70"
                  >
                    {registerText}
                  </button>
                  <p className="text-sm font-medium text-red-600">
                    {bannedMessage}
                  </p>
                </div>
              ) : (
                <form
                  action={isRegistered ? withdraw : register}
                  className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5"
                >
                  <p className="mb-3 text-sm font-medium text-gray-500">
                    {isRegistered
                      ? registeredInfoText
                      : joinPromptText}
                  </p>
                  <button
                    type="submit"
                    className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black"
                  >
                    {isRegistered ? withdrawText : registerText}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 max-w-3xl break-words text-base leading-7 text-gray-600">
          {event.description}
        </p>
      </header>

      <section className="rounded-[28px] border border-white/50 bg-white/55 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {reviewSectionTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {reviewSummary.reviewCount > 0
                ? `${reviewSummary.averageRating}/5 based on ${reviewSummary.reviewCount} review${reviewSummary.reviewCount === 1 ? "" : "s"}`
                : noReviewsText}
            </p>
          </div>
        </div>

        {user ? (
          canReview ? (
            <EventReviewForm
              submitAction={submitReview}
              initialRating={currentUserReview?.rating}
              initialComment={currentUserReview?.comment}
              maxCommentLength={EVENT_REVIEW_MAX_COMMENT_LENGTH}
            />
          ) : (
            <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {reviewRequiresAttendanceText}
            </p>
          )
        ) : (
          <p className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {reviewLoginPromptText}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-white/60 bg-white/75 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {getReviewerLabel(review)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString(dateLocale)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-amber-600">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      </section>

      {admin && (
        <div className="pt-2">
          <DeleteEventButton id={event.id} />
        </div>
      )}
    </div>
  );
}
