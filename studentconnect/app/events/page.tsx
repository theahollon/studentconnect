import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import EventsList from "./eventsList";
import EventsFilter from "./EventsFilter";
import { t } from "@/lib/i18n/server";
import { Suspense } from "react";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const admin = await isAdmin();
  const { type } = await searchParams;

  const title = await t("eventsPage.heading");
  const badge = await t("eventsPage.badge");
  const subtitle = await t("eventsPage.subtitle");
  const createText = await t("eventsPage.createButton");

  return (
    <div className="mx-auto mt-4 max-w-4xl px-6 text-center text-black">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/40 bg-white/20 px-6 py-8 backdrop-blur-[2px]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">
          {badge}
        </p>

        <h1 className="mt-3 text-5xl md:text-6xl font-semibold tracking-tight text-black">
        {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600">
          {subtitle}
        </p>

        {admin && (
          <div className="mt-8">
            <Link
              href="/admin/activities"
              className="inline-flex items-center rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)] transition hover:-translate-y-0.5 hover:bg-black"
            >
              {createText}
            </Link>
          </div>
        )}

        <div className="mt-8">
          <Suspense>
            <EventsFilter />
          </Suspense>
        </div>
      </div>

      <div className="mt-8">
        <EventsList filter={type} />
      </div>
    </div>
  );
}
