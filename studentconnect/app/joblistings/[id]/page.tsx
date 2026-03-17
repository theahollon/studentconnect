import { Suspense } from "react";
import JoblistingContent from "./JoblistingContent";
import LoadingJoblisting from "./LoadingJoblisting";

export default function JoblistingPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-[30px] border border-white/40 bg-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  <LoadingJoblisting />
                </p>
              </div>
            }
          >
            <JoblistingContent params={props.params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
