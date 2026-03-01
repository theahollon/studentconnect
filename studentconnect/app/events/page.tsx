import { Suspense } from "react";
import EventsList from "./eventsList";
import { t } from "@/lib/i18n/server";

export default function EventsPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <EventsShell />
    </Suspense>
  );
}

async function EventsShell() {
  const heading = await t("eventsPage.heading");
  const createBtn = await t("eventsPage.createButton");
  const loadingEvents = await t("eventsPage.loading");

  return (
    <div className="mx-auto max-w-4xl px-6 text-center">
      <h1 className="text-6xl font-bold">{heading}</h1>

      {/*AI generated button:*/}
      <div className="mt-10">
        <a
          href="/admin/activities"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          {createBtn}
        </a>
      </div>

      <Suspense fallback={<p>{loadingEvents}</p>}>
        <EventsList />
      </Suspense>
    </div>
  );
}