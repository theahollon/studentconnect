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
      <h1 className="text-6xl font-bold text-black">{title}</h1>

      {admin && (
        <div className="mt-10">
          <Link
            href="/admin/activities"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
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