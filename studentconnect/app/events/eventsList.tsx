/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

/**
 * Server component that fetches and renders a list of events.
 *
 * Uses the Supabase server client to query the `events` table
 * and renders each item as a navigable link.
 *
 * @returns A grid of event links or an error message if fetching fails.
 */
export default async function EventsPage() {
    // If env vars aren't configured, show a helpful warning instead of failing.

    const supabase = await createClient();
    const { data: events, error } = await supabase.from("events").select("*");

    if (error) {
        return <div>Error loading events: {error.message}</div>;
    }

    return (
        <div style={{ display: "grid" }}>
            {events?.map((event: any) => {
                const href = `/events/${event.slug ?? event.id}`;
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