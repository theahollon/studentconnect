
import { Suspense } from "react";
import JoblistingContent from "./JoblistingContent";

export default function JoblistingPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p>Laster Joblisting...</p>}>
      <JoblistingContent params={props.params} />
    </Suspense>
  );
}
