// This component was developed with assistance from AI tools.

import { Suspense } from "react";
import CompanyContent from "./CompanyContent";

/**
 * Page wrapper for the company detail view at /companies/[name].
 *
 * Uses Suspense to show a loading spinner while the async
 * CompanyContent component fetches company data.
 */

export default function CompanyPage(props: {
  params: Promise<{ name: string }>;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-500 to-pink-500 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Loading…</p>
              </div>
            }
          >
            <CompanyContent params={props.params} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}