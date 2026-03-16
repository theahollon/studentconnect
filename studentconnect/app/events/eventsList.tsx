/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getEvents, getEventReviewSummaries } from "@/lib/supabase/database";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Heart } from "lucide-react";
import ListCard from "@/components/ui/list-card";

type EventFavoriteRow = {
  event_id: string;
};

type EventListItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  organizer?: string;
  start_time?: string;
};

export default async function EventsList({ filter }: { filter?: string }) {
  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  let events: EventListItem[] | undefined;
  let error;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    events = await getEvents();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  if (error) {
    const errorText = await t("eventsList.errorLoading");
    return (
      <div>
        {errorText}: {error}
      </div>
    );
  }

  const now = Date.now();
  let favoriteEventIds = new Set<string>();

  if (user) {
    const { data: eventFavorites } = await supabase
      .from("event_favorites")
      .select("event_id")
      .eq("user_id", user.id);

    favoriteEventIds = new Set(
      ((eventFavorites ?? []) as EventFavoriteRow[]).map(
        (favorite) => favorite.event_id,
      ),
    );
  }

  const filteredEvents = filter
    ? (events ?? []).filter((e) => e.event_type === filter)
    : (events ?? []);

  const reviewSummaries = await getEventReviewSummaries(
    filteredEvents.map((event) => event.id).filter(Boolean),
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {

    const aTime = a.start_time
      ? new Date(a.start_time).getTime()
      : Number.MAX_SAFE_INTEGER;
    const bTime = b.start_time
      ? new Date(b.start_time).getTime()
      : Number.MAX_SAFE_INTEGER;

    const aIsFuture = aTime >= now;
    const bIsFuture = bTime >= now;

    if (aIsFuture && !bIsFuture) return -1;
    if (!aIsFuture && bIsFuture) return 1;

    return aTime - bTime;
  });

  const upcomingText = await t("eventsList.upcoming");
  const dateLabel = await t("eventsList.dateLabel");
  const noRatingsText = await t("eventsList.noRatings");

  async function toggleFavorite(eventId: string, currentlyFavorited: boolean) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (currentlyFavorited) {
      const { error } = await supabase
        .from("event_favorites")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("event_favorites").insert({
        event_id: eventId,
        user_id: user.id,
      });
      if (error) throw error;
    }

    revalidatePath("/events");
    revalidatePath("/favorites");
  }

  return (
    <div className="grid justify-items-center gap-1">
      {sortedEvents.map((event) => {
        if (!event?.id) return null;

        const href = `/events/${String(event.id)}`;
        const isFavorited = favoriteEventIds.has(event.id);

        const startDate = event.start_time
          ? new Date(event.start_time).toLocaleDateString(dateLocale, {
              day: "numeric",
              month: "long",
            })
          : "";
        const reviewSummary = reviewSummaries[event.id] ?? {
          averageRating: 0,
          reviewCount: 0,
        };

        const isUpcoming =
          event.start_time &&
          new Date(event.start_time).getTime() >= Date.now();

        return (
          <ListCard
            key={event.id}
            className="border-white/50 bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <Link href={href} className="flex-1 no-underline text-black">
                <div className="text-xl font-semibold tracking-tight text-gray-950">
                  {event.title}
                </div>

                {event.organizer && (
                  <div className="mt-1 text-sm font-medium text-gray-500">
                    {event.organizer}
                  </div>
                )}

                {event.description && (
                  <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-gray-600">
                    {event.description.substring(0, 140)}
                    {event.description.length > 140 ? "..." : ""}
                  </p>
                )}

                {event.location && (
                  <div className="mt-3 text-sm text-gray-500">{event.location}</div>
                )}

                <div className="mt-3 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-amber-100">
                  {reviewSummary.reviewCount > 0
                    ? `★ ${reviewSummary.averageRating}/5 (${reviewSummary.reviewCount})`
                    : noRatingsText}
                </div>

                {isUpcoming && (
                  <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    {upcomingText}
                  </div>
                )}
              </Link>

              <div className="flex min-w-[112px] flex-col items-center gap-3">
                {startDate && (
                  <div
                    className="min-w-[112px] rounded-2xl px-3 py-3 text-center ring-1 ring-black/5"
                    style={{
                      backgroundColor: isUpcoming ? "#fff6db" : "#f8fafc",
                    }}
                  >
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                      {dateLabel}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {startDate}
                    </div>
                  </div>
                )}
                <form action={toggleFavorite.bind(null, event.id, isFavorited)}>
                  <button
                    type="submit"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 leading-none shadow-sm ring-1 ring-black/5 transition-transform duration-150 hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                    aria-label={
                      isFavorited ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <Heart
                      size={30}
                      strokeWidth={2}
                      className={
                        isFavorited
                          ? "text-pink-500 fill-pink-500"
                          : "text-gray-400 fill-transparent"
                      }
                    />
                  </button>
                </form>
              </div>
            </div>
          </ListCard>
        );
      })}
    </div>
  );
}
