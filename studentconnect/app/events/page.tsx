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
    <div>
      <h1 className="text-6xl font-bold">Events</h1>

      <Suspense fallback={<p>Loading events…</p>}>
        <EventsList />
      </Suspense>
    </div>
  );
}
