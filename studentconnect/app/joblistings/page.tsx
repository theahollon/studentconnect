//implemented with support of AI

import { Suspense } from "react";
import JobList from "./jobList";
import { t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

export default function JobListingsPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <JobListingsShell />
    </Suspense>
  );
}

async function JobListingsShell() {
  const title = await t("jobListings"); 
  const loadingText = await t("jobListingsPage.loading");
  const createBtn = await t("jobListingsPage.createButton");
  const admin = await isAdmin();

  return (
    <div className="mx-auto max-w-4xl px-6 text-center">
      <h1 className="text-6xl font-bold text-black">Job Listings</h1>
      {admin &&
      <div className="mt-10">
        <a
          href="/admin/jobs"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          {createBtn}
        </a>
      </div>}

      <Suspense fallback={<p>{loadingText}</p>}>
        <JobList />
      </Suspense>
    </div>
  );
}