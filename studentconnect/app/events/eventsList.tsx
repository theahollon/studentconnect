/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getEvents } from "@/lib/supabase/database";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export default async function EventsList() {
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

  const sortedEvents = [...(events ?? [])].sort((a, b) => {
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
    revalidatePath(`/events/${eventId}`);
  }

  return (
    <div className="grid justify-items-center">
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

        const isUpcoming =
          event.start_time &&
          new Date(event.start_time).getTime() >= Date.now();

        return (
          <div
            key={event.id}
            className="block w-full max-w-[560px] rounded-lg border border-gray-300 bg-white px-5 py-4 my-3 text-black shadow-sm hover:shadow transition"
          >
            <div className="flex justify-between items-start gap-4">
              <Link href={href} className="flex-1 no-underline text-black">
                <div className="text-2xl font-bold mb-2">{event.title}</div>

                {event.organizer && (
                  <div className="text-base text-gray-500 font-semibold mb-1.5">
                    {event.organizer}
                  </div>
                )}

                {event.description && (
                  <div className="text-sm text-gray-400 mb-1.5 break-words leading-snug">
                    {event.description.substring(0, 100)}
                    {event.description.length > 100 ? "..." : ""}
                  </div>
                )}

                {event.location && (
                  <div className="text-sm text-gray-500">{event.location}</div>
                )}

                {isUpcoming && (
                  <div className="text-xs text-emerald-500 font-semibold mt-1.5">
                    {upcomingText}
                  </div>
                )}
              </Link>

              <div className="flex min-w-[100px] flex-col items-center gap-2.5">
                {startDate && (
                  <div
                    className="text-center rounded-md px-3 py-2 min-w-[100px]"
                    style={{
                      backgroundColor: isUpcoming ? "#fef3c7" : "#f3f4f6",
                    }}
                  >
                    <div className="text-xs text-gray-500 mb-0.5">
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
                    className="heart-button leading-none transition-transform active:scale-90"
                    style={{
                      color: isFavorited ? "#ec4899" : "#9ca3af",
                      fontSize: isFavorited ? "21px" : "25px",
                    }}
                    aria-label={
                      isFavorited ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    {isFavorited ? "❤" : "♡"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
