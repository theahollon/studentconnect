/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getJobListings } from "@/lib/supabase/database";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Heart } from "lucide-react";

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
    <div style={{ display: "grid", justifyItems: "center" }}>
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
          <div
            key={jobListing.id}
            className="transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-pink-300"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 560,
              padding: "16px 20px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              margin: "12px 0",
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
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  {jobListing.title}
                </div>

                {jobListing.company && (
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#6b7280",
                      fontWeight: "600",
                      marginBottom: "6px",
                    }}
                  >
                    {jobListing.company}
                  </div>
                )}

                {jobListing.description && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      marginBottom: "6px",
                      lineHeight: "1.4",
                      wordBreak: "break-word",
                    }}
                  >
                    {jobListing.description.substring(0, 100)}
                    {jobListing.description.length > 100 ? "..." : ""}
                  </div>
                )}

                {jobListing.location && (
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    {jobListing.location}
                  </div>
                )}
              </Link>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: "100px",
                }}
              >
                {applicationDeadline && (
                  <div
                    style={{
                      textAlign: "center",
                      backgroundColor: isUpcomingDeadline ? "#fef3c7" : "#f3f4f6",
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
                    className="inline-flex items-center justify-center transition-transform duration-150 hover:scale-125 hover:-translate-y-0.5 active:scale-75 active:-translate-y-1"
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
          </div>
        );
      })}
    </div>
  );
}

 
