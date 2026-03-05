// content implemented with use of AI

import { getJoblistingById } from "@/lib/supabase/database";
import { notFound } from "next/navigation";
import DeleteJoblistingButton from "./DeleteJoblistingButton";
import { getLocale, t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

type JoblistingDetails = {
  location?: string | null;
  application_deadline?: string | null;
  employment_type?: string | null;
  contact_email?: string | null;
  application_url?: string | null;
  company?: string | null;
};

function formatDate(value: string | null | undefined, dateLocale: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function JoblistingContent(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const joblisting = await getJoblistingById(id);
  if (!joblisting) return notFound();
  const job = joblisting as typeof joblisting & JoblistingDetails;

  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  // NB: disse feltene må finnes i job_postings (og være lagret fra JobAdForm)
  const location = job.location;
  const application_deadline = job.application_deadline;
  const employment_type = job.employment_type;
  const contact_email = job.contact_email;
  const application_url = job.application_url;

  // Determine whether the deadline has passed (compare by calendar date in Europe/Oslo)
  const dateKey = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Oslo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);

  const isDeadlinePassed = (() => {
    if (!application_deadline) return false;
    const d = new Date(application_deadline);
    if (Number.isNaN(d.getTime())) return false;
    const todayKey = dateKey(new Date());
    const deadlineKey = dateKey(d);
    return deadlineKey < todayKey;
  })();

  const hasMeta =
    location || application_deadline || employment_type || contact_email || application_url;

  // i18n labels
  const keyInfoTitle = await t("joblistingContent.keyInformation");
  const locationLabel = await t("joblistingContent.location");
  const employmentTypeLabel = await t("joblistingContent.employmentType");
  const deadlineLabel = await t("joblistingContent.applicationDeadline");
  const contactLabel = await t("joblistingContent.contact");
  const applyNowText = await t("joblistingContent.applyNow");
  const deadlinePassedText = await t("joblistingContent.deadlinePassed");
  const descriptionTitle = await t("joblistingContent.description");
  

  // Employment type label: reuse JobAdForm keys if possible
  const employmentTypeText = employment_type
    ? await t(`jobAdForm.employmentTypes.${employment_type}`)
    : null;
  const admin = await isAdmin();

  return (
    <div className="p-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-5xl font-bold text-gray-900">{joblisting.title}</h1>
        {job.company && (
          <p className="text-lg text-gray-600">{job.company}</p>
        )}
      </header>

      {hasMeta && (
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">{keyInfoTitle}</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {location && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{locationLabel}</dt>
                <dd className="mt-1 text-gray-900">{location}</dd>
              </div>
            )}

            {employment_type && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{employmentTypeLabel}</dt>
                <dd className="mt-1 text-gray-900">
                  {employmentTypeText ?? employment_type}
                </dd>
              </div>
            )}

            {application_deadline && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{deadlineLabel}</dt>
                <dd className="mt-1 text-gray-900">
                  {formatDate(application_deadline, dateLocale)}
                </dd>
              </div>
            )}

            {contact_email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{contactLabel}</dt>
                <dd className="mt-1 text-gray-900">
                  <a className="underline break-all" href={`mailto:${contact_email}`}>
                    {contact_email}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          {application_url && (
            <div className="mt-6">
              {isDeadlinePassed ? (
                <span
                  className="inline-flex items-center justify-center rounded-xl bg-gray-300 px-4 py-2 font-medium text-gray-700"
                  aria-disabled="true"
                >
                  {deadlinePassedText}
                </span>
              ) : (
                <a
                  href={application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  {applyNowText}
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {joblisting.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">{descriptionTitle}</h2>
          <p className="text-gray-700 break-words whitespace-pre-wrap">
            {joblisting.description}
          </p>
        </section>
      )}

      <div className="pt-2">
        {admin && <DeleteJoblistingButton id={joblisting.id} />}
      </div>
    </div>
  );
}
