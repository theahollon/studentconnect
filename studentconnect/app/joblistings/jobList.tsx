/**
 * Acknowledgement: Implemented with assistance from GitHub Copilot.
 */
import { getJobListings } from "@/lib/supabase/database";
import Link from "next/link";

/**
 * Server component that fetches and renders a list of job listings.
 *
 * Uses the database layer to query job listings
 * and renders each item as a navigable link.
 *
 * @returns A grid of job listing links or an error message if fetching fails.
 */
export default async function JobListingsPage() {
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
    return <div>Error loading job listings: {error}</div>;
  }

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      {jobListings?.map((jobListing: any) => {
        const href = `/joblistings/${jobListing.slug ?? jobListing.id}`;
        const deadline = jobListing.deadline
          ? new Date(jobListing.deadline).toLocaleDateString("nb-NO", {
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
              {deadline && (
                <div
                  style={{
                    textAlign: "center",
                    backgroundColor: "#f3f4f6",
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
                    Frist
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    {deadline}
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
