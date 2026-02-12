//AI generated code:

import { Suspense } from "react";
import EventContent from "./EventContent";

export default function EventPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p>Laster event...</p>}>
      <EventContent params={props.params} />
    </Suspense>
  );
}
