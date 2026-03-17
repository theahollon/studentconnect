import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { t } from "@/lib/i18n/server";
import type {
  EventFavoriteRow,
  FavoriteEvent,
  FavoriteJob,
  JobFavoriteRow,
} from "@/lib/supabase/types";
import { t } from "@/lib/i18n/server";
import FavoritesList from "./favoritesList";

export default async function FavoritesPage() {
  const title = await t("favoritesPage.title");
  const subtitle = await t("favoritesPage.subtitle");
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

  const favoriteEvents = ((eventFavorites ?? []) as EventFavoriteRow[])
    .map((row) =>
      Array.isArray(row.events) ? row.events[0] ?? null : row.events,
    )
    .filter((event): event is FavoriteEvent => !!event);

  const favoriteJobs = ((jobFavorites ?? []) as JobFavoriteRow[])
    .map((row) =>
      Array.isArray(row.job_postings)
        ? row.job_postings[0] ?? null
        : row.job_postings,
    )
    .filter((job): job is FavoriteJob => !!job);

  const heading = await t("favoritesPage.heading");
  const subtitle = await t("favoritesPage.subtitle");
  const eventsHeading = await t("favoritesPage.eventsHeading");
  const noEvents = await t("favoritesPage.noEvents");
  const jobsHeading = await t("favoritesPage.jobsHeading");
  const noJobs = await t("favoritesPage.noJobs");

  return (
    <div className="mx-auto max-w-4xl px-6 text-center text-black">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-black">
        {title}
      </h1>
      <p className="mt-2 text-base text-gray-500">
        {subtitle}
      </p>
      <FavoritesList
        favoriteEvents={favoriteEvents}
        favoriteJobs={favoriteJobs}
        labels={{ eventsHeading, noEvents, jobsHeading, noJobs }}
      />
    </div>
  );
}
