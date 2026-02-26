import { Suspense } from "react";
import EventsList from "./eventsList";

/**
 * Events route page component.
 *
 * Renders the page heading and defers the events list
 * rendering to a Suspense boundary so data fetching can
 * happen asynchronously without blocking the shell.
 *
 * @returns The JSX for the events page.
 */
export default function EventsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 text-center">
      <h1 className="text-6xl font-bold">Events</h1>

            {/*AI generated button:*/}
            <div className="mt-10">
        <a
          href="/admin/activities"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
        >
          Create new event
        </a>
      </div>

      <Suspense fallback={<p>Loading events…</p>}>
        <EventsList />
      </Suspense>
    </div>
  );
}
