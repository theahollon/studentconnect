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
  const createText = await t("eventsPage.createButton");

  return (
    <div className="mx-auto max-w-4xl px-6 text-center text-black">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-black">
        {title}
      </h1>
      <p className="mt-2 text-base text-gray-500">
        Discover upcoming activities and student events
      </p>

      {admin && (
        <div className="mt-10">
          <Link
            href="/admin/activities"
            className="inline-block rounded-lg bg-pink-500 px-6 py-3 text-white font-semibold hover:bg-pink-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition transform"
          >
            {createText}
          </Link>
        </div>
      )}

      <Suspense>
        <EventsFilter />
      </Suspense>

      <div className="mt-8">
        <EventsList filter={type} />
      </div>

    </div>
  );
}
