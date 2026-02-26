// content implemented with use of AI

import { getJoblistingById } from "@/lib/supabase/database";
import { notFound } from "next/navigation";
import DeleteJoblistingButton from "./DeleteJoblistingButton";

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("no-NO", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function labelEmploymentType(v: string | null | undefined) {
  if (!v) return null;
  const map: Record<string, string> = {
    fulltime: "Full-time",
    parttime: "Part-time",
    internship: "Internship",
    temporary: "Temporary",
  };
  return map[v] ?? v;
}

export default async function JoblistingContent(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const joblisting = await getJoblistingById(id);
  if (!joblisting) return notFound();

  // NB: disse feltene må finnes i job_postings (og være lagret fra JobAdForm)
  const location = (joblisting as any).location as string | null | undefined;
  const application_deadline = (joblisting as any).application_deadline as string | null | undefined;
  const employment_type = (joblisting as any).employment_type as string | null | undefined;
  const contact_email = (joblisting as any).contact_email as string | null | undefined;
  const application_url = (joblisting as any).application_url as string | null | undefined;

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

  return (
    <div className="p-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-5xl font-bold text-gray-900">{joblisting.title}</h1>
        {(joblisting as any).company && (
          <p className="text-lg text-gray-600">{(joblisting as any).company}</p>
        )}
      </header>

      {hasMeta && (
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Key information</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {location && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-gray-900">{location}</dd>
              </div>
            )}

            {employment_type && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Employment type</dt>
                <dd className="mt-1 text-gray-900">{labelEmploymentType(employment_type)}</dd>
              </div>
            )}

            {application_deadline && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Application deadline</dt>
                <dd className="mt-1 text-gray-900">{formatDate(application_deadline)}</dd>
              </div>
            )}

            {contact_email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Contact</dt>
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
                  Application deadline passed
                </span>
              ) : (
                <a
                  href={application_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  Apply now
                </a>
              )}
            </div>
          )}
        </section>
      )}

      {joblisting.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Description</h2>
          <p className="text-gray-700 break-words whitespace-pre-wrap">
            {joblisting.description}
          </p>
        </section>
      )}

      <div className="pt-2">
        <DeleteJoblistingButton id={joblisting.id} />
      </div>
    </div>
  );
}