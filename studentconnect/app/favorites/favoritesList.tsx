/**
 * Acknowledgement: Implemented with assistance from AI.
 */
import Link from "next/link";
import type { FavoriteEvent, FavoriteJob } from "@/lib/supabase/types";
import ListCard from "@/components/ui/list-card";
import { t } from "@/lib/i18n/client";

type FavoritesListProps = {
  favoriteEvents: FavoriteEvent[];
  favoriteJobs: FavoriteJob[];
  labels: {
    eventsHeading: string;
    noEvents: string;
    jobsHeading: string;
    noJobs: string;
  };
};

export default function FavoritesList({
  favoriteEvents,
  favoriteJobs,
  labels,
}: FavoritesListProps) {
  return (
    <>
      <section className="mt-10">
        <div className="mb-4 text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
            {t("favoritesPage.eventsTitle")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("favoritesPage.eventsSubtitle")}
          </p>
        </div>
        {favoriteEvents.length === 0 ? (
          <p className="mt-3 text-left text-gray-600">
            {t("favoritesPage.eventsEmpty")}
          </p>
        ) : (
          <div className="mt-4 grid gap-1">
            {favoriteEvents.map((event) => (
              <ListCard
                key={event.id}
                className="border-white/50 bg-white/70 text-left shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm"
              >
                <Link href={`/events/${event.id}`} className="block">
                  <h3 className="text-xl font-semibold tracking-tight text-gray-950">
                    {event.title}
                  </h3>
                  {event.start_time && (
                    <div className="mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-amber-100">
                      {new Date(event.start_time).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                  )}
                  {event.location && (
                    <p className="mt-3 text-sm text-gray-500">{event.location}</p>
                  )}
                  {event.description && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                      {event.description.slice(0, 140)}
                      {event.description.length > 140 ? "..." : ""}
                    </p>
                  )}
                </Link>
              </ListCard>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950">
            {t("favoritesPage.jobsTitle")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("favoritesPage.jobsSubtitle")}
          </p>
        </div>
        {favoriteJobs.length === 0 ? (
          <p className="mt-3 text-left text-gray-600">
            {t("favoritesPage.jobsEmpty")}
          </p>
        ) : (
          <div className="mt-4 grid gap-1">
            {favoriteJobs.map((job) => (
              <ListCard
                key={job.id}
                className="border-white/50 bg-white/70 text-left shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm"
              >
                <Link href={`/joblistings/${job.id}`} className="block">
                  <h3 className="text-xl font-semibold tracking-tight text-gray-950">
                    {job.title}
                  </h3>
                  {job.company && (
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      {job.company}
                    </p>
                  )}
                  {job.description && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                      {job.description.slice(0, 140)}
                      {job.description.length > 140 ? "..." : ""}
                    </p>
                  )}
                </Link>
              </ListCard>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
