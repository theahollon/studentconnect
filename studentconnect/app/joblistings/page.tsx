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
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-black">
        {title}
      </h1>
      <p className="mt-2 text-base text-gray-500">
        Find internships and job opportunities for students
      </p>
      {admin &&
      <div className="mt-10">
        <a
          href="/admin/jobs"
          className="inline-block rounded-lg bg-pink-500 px-6 py-3 text-white font-semibold hover:bg-pink-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition transform"
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
