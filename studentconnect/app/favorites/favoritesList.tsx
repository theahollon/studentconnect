/**
 * Acknowledgement: Implemented with assistance from AI.
 */
import Link from "next/link";
import type { FavoriteEvent, FavoriteJob } from "@/lib/supabase/types";

type FavoritesListProps = {
  favoriteEvents: FavoriteEvent[];
  favoriteJobs: FavoriteJob[];
};

export default function FavoritesList({
  favoriteEvents,
  favoriteJobs,
}: FavoritesListProps) {

  return (
    <>
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
    </>
  );
}
