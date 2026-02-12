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
        error = (anyErr?.message as string)
          ?? (anyErr?.error?.message as string)
          ?? JSON.stringify(anyErr);
    }

    if (error) {
        return <div>Error loading job listings: {error}</div>;
    }

    return (
        <div style={{ display: "grid" }}>
            {jobListings?.map((jobListing: any) => {
                const href = `/joblistings/${jobListing.slug ?? jobListing.id}`;
                return (
                    <Link
                        key={jobListing.id}
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
                        {jobListing.title}
                    </Link>
                );
            })}
        </div>
    );
}   