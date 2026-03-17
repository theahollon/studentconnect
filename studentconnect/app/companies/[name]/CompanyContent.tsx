// This component was developed with assistance from AI tools.

import {
  getCompanyByName,
  getEventsByCompany,
  getJobListingsByCompany,
} from "@/lib/supabase/database";
import { notFound } from "next/navigation";
import Link from "next/link";
import DeleteCompanyButton from "./DeleteCompanyButton";
import { getLocale, t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

/**
 * Server component that displays a company's full profile page.
 *
 * Shows the company name, description, website link, and lists
 * all events and job postings associated with the company
 * (matched via the "company" foreign key column).
 * Admins see a delete button at the bottom.
 *
 * @param props.params - Route params containing the company name (URL-encoded).
 */

export default async function CompanyContent(props: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await props.params;
  const decodedName = decodeURIComponent(name);

  const company = await getCompanyByName(decodedName);
  if (!company) return notFound();

  const [events, jobListings] = await Promise.all([
    getEventsByCompany(company.name),
    getJobListingsByCompany(company.name),
  ]);

  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";
  const admin = await isAdmin();

  const descriptionLabel = await t("companyDetail.description");
  const websiteLabel = await t("companyDetail.website");
  const eventsLabel = await t("companyDetail.events");
  const jobListingsLabel = await t("companyDetail.jobListings");
  const noEventsLabel = await t("companyDetail.noEvents");
  const noJobListingsLabel = await t("companyDetail.noJobListings");
  const visitWebsite = await t("companyDetail.visitWebsite");

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-5xl font-bold text-gray-900">{company.name}</h1>
      </header>

      {/* Description */}
      {company.description && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {descriptionLabel}
          </h2>
          <p className="text-lg text-gray-700 break-words">
            {company.description}
          </p>
        </section>
      )}

      {/* Website */}
      {company.website_url && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {websiteLabel}
          </h2>
          <a
            href={company.website_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {visitWebsite}
          </a>
        </section>
      )}

      {/* Events */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {eventsLabel}
        </h2>
        {events.length === 0 ? (
          <p className="text-gray-500">{noEventsLabel}</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const startDate = event.start_time
                ? new Date(event.start_time).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 no-underline text-black hover:shadow transition"
                >
                  <div className="text-xl font-bold">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {event.description.substring(0, 100)}
                      {event.description.length > 100 ? "..." : ""}
                    </div>
                  )}
                  {startDate && (
                    <div className="text-sm text-gray-400 mt-1">{startDate}</div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Job Listings */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {jobListingsLabel}
        </h2>
        {jobListings.length === 0 ? (
          <p className="text-gray-500">{noJobListingsLabel}</p>
        ) : (
          <div className="space-y-3">
            {jobListings.map((job) => (
              <Link
                key={job.id}
                href={`/joblistings/${job.id}`}
                className="block rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 no-underline text-black hover:shadow transition"
              >
                <div className="text-xl font-bold">{job.title}</div>
                {job.description && (
                  <div className="text-sm text-gray-500 mt-1">
                    {job.description.substring(0, 100)}
                    {job.description.length > 100 ? "..." : ""}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Admin delete button */}
      {admin && <DeleteCompanyButton id={company.id} />}
    </div>
  );
}
