//implemented with support of AI

import { Suspense } from "react";
import JobList from "./jobList";
import JobListingsFilter from "./JobListingsFilter";
import { t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

export default function JobListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <JobListingsShell searchParams={searchParams} />
    </Suspense>
  );
}

async function JobListingsShell({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const title = await t("jobListings");

  const loadingText = await t("jobListingsPage.loading");
  const badge = await t("jobListingsPage.badge");
  const subtitle = await t("jobListingsPage.subtitle");
  const createBtn = await t("jobListingsPage.createButton");
  const admin = await isAdmin();
  const { type } = await searchParams;

  return (
    <div className="mx-auto mt-4 max-w-4xl px-6 text-center">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/40 bg-white/20 px-6 py-8 backdrop-blur-[2px]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
          {badge}
        </p>

        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-black md:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
          {subtitle}
        </p>
        {admin && (
          <div className="mt-8">
            <a
              href="/admin/jobs"
              className="inline-flex items-center rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)] transition hover:-translate-y-0.5 hover:bg-black"
            >
              {createBtn}
            </a>
          </div>
        )}

        <div className="mt-8">
          <Suspense>
            <JobListingsFilter />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<p>{loadingText}</p>}>
        <div className="mt-8">
          <JobList filter={type} />
        </div>
      </Suspense>
    </div>
  );
}
