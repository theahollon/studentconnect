import { Suspense } from "react";
import JobList from "./jobList";
import { t } from "@/lib/i18n/server";

/**
 * Job listings route page component.
 *
 * Renders the page heading and defers the job listings list
 * rendering to a Suspense boundary so data fetching can
 * happen asynchronously without blocking the shell.
 *
 * @returns The JSX for the job listings page.
 */
export default function JobListingsPage() {
const title = t("jobListings");

  return (
    <div className="mx-auto max-w-4xl px-6 text-center">
      <h1 className="text-6xl font-bold text-center">{title}</h1>

      <Suspense fallback={<p className="text-center">Loading job listings…</p>}>
            {/*AI generated button:*/}
            <div className="mt-10">
        <a
          href="admin/jobs"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          Create new joblisting
        </a>
      </div>
      </Suspense>
      <Suspense fallback={<p>Loading job listings…</p>}>
        <JobList />
      </Suspense>

    </div>
  );
}
