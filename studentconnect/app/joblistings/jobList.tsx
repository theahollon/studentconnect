/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getJobListings } from "@/lib/supabase/database";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Heart } from "lucide-react";
import ListCard from "@/components/ui/list-card";

type JobFavoriteRow = {
  job_id: string;
};

type JobListItem = {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  application_deadline?: string;
  employment_type?: string;
};

/**
 * Server component that fetches and renders a list of job listings.
 *
 * Uses the database layer to query job listings
 * and renders each item as a navigable link.
 *
 * @returns A grid of job listing links or an error message if fetching fails.
 */
export default async function JobListingsPage({
  filter,
}: {
  filter?: string;
}) {
  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  let jobListings: JobListItem[] | undefined;
  let error: string | undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    jobListings = await getJobListings();
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = JSON.stringify(err);
    }
  }

  if (error) {
    const errorText = await t("jobList.errorLoading");
    return (
      <div>
        {errorText}: {error}
      </div>
    );
  }

  const deadlineLabel = await t("jobList.applicationDeadline");

  async function toggleFavorite(jobId: string, currentlyFavorited: boolean) {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (currentlyFavorited) {
      const { error } = await supabase
        .from("job_favorites")
        .delete()
        .eq("job_id", jobId)
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("job_favorites").insert({
        job_id: jobId,
        user_id: user.id,
      });

      if (error) throw error;
    }

    revalidatePath("/joblistings");
    revalidatePath("/favorites");
  }

  let favoriteJobIds = new Set<string>();

  if (user) {
    const { data: jobFavorites } = await supabase
      .from("job_favorites")
      .select("job_id")
      .eq("user_id", user.id);

    favoriteJobIds = new Set(
      ((jobFavorites ?? []) as JobFavoriteRow[]).map(
        (favorite) => favorite.job_id,
      ),
    );
  }

  const filteredListings = filter
    ? (jobListings ?? []).filter((job) => job.employment_type === filter)
    : (jobListings ?? []);

  return (
    <div className="grid justify-items-center gap-1">
      {filteredListings.map((jobListing) => {
        if (!jobListing?.id) return null;

        const href = `/joblistings/${jobListing.slug ?? jobListing.id}`;
        const isFavorited = favoriteJobIds.has(jobListing.id);
        const deadlineDate = jobListing.application_deadline
          ? new Date(jobListing.application_deadline)
          : null;

        const dateKey = (date: Date) =>
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Europe/Oslo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(date);

        const todayKey = dateKey(new Date());
        const deadlineKey = deadlineDate ? dateKey(deadlineDate) : null;
        const isUpcomingDeadline = !!deadlineKey && deadlineKey >= todayKey;

        const applicationDeadline = deadlineDate
          ? deadlineDate.toLocaleDateString(dateLocale, {
              day: "numeric",
              month: "long",
            })
          : "";

        return (
          <ListCard
            key={jobListing.id}
            className="border-white/50 bg-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "16px",
              }}
            >
              <Link
                href={href}
                role="button"
                style={{
                  flex: 1,
                  textDecoration: "none",
                  color: "#000",
                  display: "block",
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  {jobListing.title}
                </div>

                {jobListing.company && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      fontWeight: "500",
                      marginTop: "4px",
                    }}
                  >
                    {jobListing.company}
                  </div>
                )}

                {jobListing.description && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#4b5563",
                      marginTop: "12px",
                      lineHeight: "1.6",
                      wordBreak: "break-word",
                      maxWidth: "42rem",
                    }}
                  >
                    {jobListing.description.substring(0, 140)}
                    {jobListing.description.length > 140 ? "..." : ""}
                  </div>
                )}

                {jobListing.location && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginTop: "12px",
                    }}
                  >
                    {jobListing.location}
                  </div>
                )}

                {jobListing.employment_type && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      marginTop: "12px",
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      backgroundColor: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: "14px",
                      fontWeight: "500",
                      boxShadow: "inset 0 0 0 1px rgba(191, 219, 254, 1)",
                    }}
                  >
                    {jobListing.employment_type}
                  </div>
                )}
              </Link>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  minWidth: "112px",
                }}
              >
                {applicationDeadline && (
                  <div
                    style={{
                      textAlign: "center",
                      backgroundColor: isUpcomingDeadline ? "#fff6db" : "#f8fafc",
                      padding: "12px",
                      borderRadius: "16px",
                      minWidth: "112px",
                      boxShadow: "inset 0 0 0 1px rgba(17, 24, 39, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginBottom: "4px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {deadlineLabel}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      {applicationDeadline}
                    </div>
                  </div>
                )}

                <form
                  action={toggleFavorite.bind(null, jobListing.id, isFavorited)}
                >
                  <button
                    type="submit"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 shadow-sm ring-1 ring-black/5 transition-transform duration-150 hover:-translate-y-0.5 hover:scale-105 active:scale-95"
                    aria-label={
                      isFavorited ? "Remove from favorites" : "Add to favorites"
                    }
                  >
                    <Heart
                      size={30}
                      strokeWidth={2}
                      className={
                        isFavorited
                          ? "text-pink-500 fill-pink-500"
                          : "text-gray-400 fill-transparent"
                      }
                    />
                  </button>
                </form>
              </div>
            </div>
          </ListCard>
        );
      })}
    </div>
  );
}

 
