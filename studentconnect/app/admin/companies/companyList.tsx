// This component was developed with assistance from AI tools.

import { getCompanies } from "@/lib/supabase/database";
import Link from "next/link";
import { t } from "@/lib/i18n/server";

/**
 * Server component that fetches and renders a list of all companies.
 *
 * Companies are sorted alphabetically by name.
 * Each card links to the company detail page at /companies/{name}.
 *
 * @returns A grid of company cards, or an error message if the fetch fails.
 */

export default async function CompanyList() {
  let companies;
  let error;

  try {
    companies = await getCompanies();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  if (error) {
    const errorText = await t("companiesList.errorLoading");
    return (
      <div>
        {errorText}: {error}
      </div>
    );
  }

  const sortedCompanies = [...(companies ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="grid justify-items-center">
      {sortedCompanies.map((company) => {
        if (!company?.id) return null;

        const href = `/companies/${encodeURIComponent(company.name)}`;

        return (
          <Link
            key={company.id}
            href={href}
            className="block w-full max-w-[560px] rounded-lg border border-gray-300 bg-white px-5 py-4 my-3 no-underline text-black shadow-sm hover:shadow transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 text-left">
                <div className="text-2xl font-bold mb-2">{company.name}</div>

                {company.description && (
                  <div className="text-sm text-gray-400 mb-1.5 break-words leading-snug">
                    {company.description.substring(0, 120)}
                    {company.description.length > 120 ? "..." : ""}
                  </div>
                )}

                {company.website_url && (
                  <div className="text-sm text-blue-500">{company.website_url}</div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}