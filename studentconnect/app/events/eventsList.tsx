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
        const aTime = a.start_time ? new Date(a.start_time).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.start_time ? new Date(b.start_time).getTime() : Number.MAX_SAFE_INTEGER;
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
                return (
                    <Link
                        key={event.id}
                        href={href}
                        role="button"
                        style={{
                            display: "block",
                            width: "100%",
                            maxWidth: 560,
                            padding: "10px 16px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            margin: "10px 0",
                            textDecoration: "none",
                            fontSize: "24px",
                            color: "#000",
                            backgroundColor: "#fff",
                        }}
                    >
                        <span
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "16px",
                            }}
                        >
                            <span>{event.title}</span>
                            {startDate && (
                                <span
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                    }}
                                >
                                    {startDate}
                                </span>
                            )}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}