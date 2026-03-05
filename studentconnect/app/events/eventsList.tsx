/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getEvents } from "@/lib/supabase/database";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n/server";

export default async function EventsList({ filter }: { filter?: string }) {
  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  let events;
  let error;

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
  const filteredEvents = filter
    ? (events ?? []).filter((e: any) => e.event_type === filter)
    : (events ?? []);
  const sortedEvents = [...filteredEvents].sort((a: any, b: any) => {
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

  return (
    <div className="grid justify-items-center">
      {sortedEvents.map((event: any) => {
        if (!event?.id) return null;

        const href = `/events/${String(event.id)}`;

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
          <Link
            key={event.id}
            href={href}
            className="block w-full max-w-[560px] rounded-lg border border-gray-300 bg-white px-5 py-4 my-3 no-underline text-black shadow-sm hover:shadow transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
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
              </div>

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
            </div>
          </Link>
        );
      })}
    </div>
  );
}