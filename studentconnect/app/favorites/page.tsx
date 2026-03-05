import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type FavoriteEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time?: string;
};

type FavoriteJob = {
  id: string;
  title: string;
  description?: string;
  company?: string;
};

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: eventFavorites, error: eventError } = await supabase
    .from("event_favorites")
    .select(
      `
      events (
        id,
        title,
        description,
        location,
        start_time
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (eventError) throw eventError;

  const { data: jobFavorites, error: jobError } = await supabase
    .from("job_favorites")
    .select(
      `
      job_postings (
        id,
        title,
        description,
        company
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (jobError) throw jobError;

  const favoriteEvents = (eventFavorites ?? [])
    .map((row) => row.events as FavoriteEvent | null)
    .filter((event): event is FavoriteEvent => !!event);

  const favoriteJobs = (jobFavorites ?? [])
    .map((row) => row.job_postings as FavoriteJob | null)
    .filter((job): job is FavoriteJob => !!job);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-black">
      <h1 className="text-5xl font-bold">Favorites</h1>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Events</h2>
        {favoriteEvents.length === 0 ? (
          <p className="mt-3 text-gray-600">No favorite events yet.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {favoriteEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-lg border border-gray-300 bg-white p-4 hover:shadow"
              >
                <h3 className="text-xl font-semibold">{event.title}</h3>
                {event.start_time && (
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(event.start_time).toLocaleString()}
                  </p>
                )}
                {event.location && (
                  <p className="mt-1 text-sm text-gray-600">{event.location}</p>
                )}
                {event.description && (
                  <p className="mt-2 text-sm text-gray-700">
                    {event.description.slice(0, 140)}
                    {event.description.length > 140 ? "..." : ""}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Job listings</h2>
        {favoriteJobs.length === 0 ? (
          <p className="mt-3 text-gray-600">No favorite job listings yet.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {favoriteJobs.map((job) => (
              <Link
                key={job.id}
                href={`/joblistings/${job.id}`}
                className="block rounded-lg border border-gray-300 bg-white p-4 hover:shadow"
              >
                <h3 className="text-xl font-semibold">{job.title}</h3>
                {job.company && (
                  <p className="mt-1 text-sm text-gray-600">{job.company}</p>
                )}
                {job.description && (
                  <p className="mt-2 text-sm text-gray-700">
                    {job.description.slice(0, 140)}
                    {job.description.length > 140 ? "..." : ""}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
