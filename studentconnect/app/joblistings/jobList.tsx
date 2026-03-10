/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getJobListings } from "@/lib/supabase/database";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n/server";

/**
 * Server component that fetches and renders a list of job listings.
 *
 * Uses the database layer to query job listings
 * and renders each item as a navigable link.
 *
 * @returns A grid of job listing links or an error message if fetching fails.
 */
export default async function JobListingsPage({ filter }: { filter?: string }) {
  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  let jobListings;
  let error: string | undefined;

  try {
    jobListings = await getJobListings();
  } catch (err) {
    const anyErr = err as any;
    // Prefer standard Error.message, then PostgrestError.message, else stringify
    error =
      (anyErr?.message as string) ??
      (anyErr?.error?.message as string) ??
      JSON.stringify(anyErr);
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

  const filteredListings = filter
    ? (jobListings ?? []).filter((j: any) => j.employment_type === filter)
    : (jobListings ?? []);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      {filteredListings.map((jobListing: any) => {
        if (!jobListing?.id) return null;
        const href = `/joblistings/${jobListing.slug ?? jobListing.id}`;
        const deadlineDate = jobListing.application_deadline
          ? new Date(jobListing.application_deadline)
          : null;

        // Compare by calendar date in Europe/Oslo to avoid server-timezone drift
        const dateKey = (d: Date) =>
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "Europe/Oslo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(d);

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
          <Link
            key={jobListing.id}
            href={href}
            role="button"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 560,
              padding: "16px 20px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              margin: "12px 0",
              textDecoration: "none",
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
              <div style={{ flex: 1 }}>
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
              </div>

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
            </div>
          </Link>
        );
      })}
    </div>
  );
}