import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import EventsList from "./eventsList";
import { t } from "@/lib/i18n/server";

export default async function EventsPage() {
  const admin = await isAdmin();

  const title = await t("eventsPage.heading");
  const createText = await t("eventsPage.createButton");

  return (
    <div className="mx-auto max-w-4xl px-6 text-center">
      <h1 className="text-6xl font-bold text-center">{title}</h1>

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

      <div className="mt-8">
        <EventsList />
      </div>
    </div>
  );
}