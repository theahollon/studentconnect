/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getEvents } from "@/lib/supabase/database";
import Link from "next/link";

/**
 * Server component that fetches and renders a list of events.
 *
 * Uses the database layer to query events
 * and renders each item as a navigable link.
 *
 * @returns A grid of event links or an error message if fetching fails.
 */
export default async function EventsPage() {
  let events;
  let error;

  try {
    events = await getEvents();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  if (error) {
    return <div>Error loading events: {error}</div>;
  }

  const now = Date.now();
  const sortedEvents = [...(events ?? [])].sort((a: any, b: any) => {
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

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      {sortedEvents.map((event: any) => {
        const href = `/events/${event.slug ?? event.id}`;
        const startDate = event.start_time
          ? new Date(event.start_time).toLocaleDateString("nb-NO", {
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
            role="button"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 560,
              padding: "16px 20px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              margin: "12px 0",
              textDecoration: "none",
              fontSize: "20px",
              color: "#000",
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  {event.title}
                </div>
                {event.organizer && (
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#6b7280",
                      fontWeight: "600",
                      marginBottom: "6px",
                    }}
                  >
                    {event.organizer}
                  </div>
                )}
                {event.description && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                      lineHeight: "1.4",
                    }}
                  >
                    {event.description.substring(0, 100)}
                    {event.description.length > 100 ? "..." : ""}
                  </div>
                )}
                {event.location && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    {event.location}
                  </div>
                )}
                {isUpcoming && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#10b981",
                      fontWeight: "600",
                      marginTop: "6px",
                    }}
                  >
                    🔴 Kommende
                  </div>
                )}
              </div>
              {startDate && (
                <div
                  style={{
                    textAlign: "center",
                    backgroundColor: isUpcoming ? "#fef3c7" : "#f3f4f6",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    minWidth: "100px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginBottom: "2px",
                    }}
                  >
                    Dato
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
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
