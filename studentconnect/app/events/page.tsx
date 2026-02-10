import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default async function EventsPage() {
    const { data: events, error } = await supabase
    .from("events")
    .select("*");

    if (error) {
        return <div>Error loading events: {error.message}</div>;
    }

if (error) {
        return <div>Failed to load events.</div>;
    }

    return (
        <div style={{ display: "grid", gap: 8 }}>
            {events?.map((event: any) => {
                const href = `/events/${event.slug ?? event.id}`;
                return (
                    <Link
                        key={event.id}
                        href={href}
                        role="button"
                        style={{
                            display: "inline-block",
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #ccc",
                            textDecoration: "none",
                        }}
                    >
                        {event.title}
                    </Link>
                );
            })}
        </div>
    );
}