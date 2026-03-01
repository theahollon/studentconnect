import { Suspense } from "react";
import JoblistingContent from "./JoblistingContent";
import LoadingJoblisting from "./LoadingJoblisting";

export default function JoblistingPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-500 to-pink-500 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
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