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

    return (
        <div style={{ display: "grid" }}>
            {events?.map((event: any) => {
                const href = `/events/${event.id}`;
                return (
                    <Link
                        key={event.id}
                        href={href}
                        role="button"
                        style={{
                            display: "inline-block",
                            padding: "8px 8px 8px 30px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            margin: "10px",
                            textDecoration: "none",
                            fontSize: "32px",
                        }}
                    >
                        {event.title}
                    </Link>
                );
            })}
        </div>
    );
}