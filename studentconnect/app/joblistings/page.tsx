import { Suspense } from "react";
import JobList from "./jobList";

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
  return (
    <div>
      <h1 className="text-6xl font-bold">Job Listings</h1>

            {/*AI generated button:*/}
            <div className="mt-10">
        <a
          href="admin/jobs"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          Create new joblisting
        </a>
      </div>

      <Suspense fallback={<p>Loading job listings…</p>}>
        <JobList />
      </Suspense>

    </div>
  );
}