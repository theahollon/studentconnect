// Denne komponenten er utviklet med støtte fra KI-verktøy.
// Koden er gjennomgått, forstått og tilpasset prosjektets behov.

"use client"; // Sørger for at komponenten kjøres på klienten

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Database: importerer funksjon for å lage Supabase-klient

// TypeScript-type som beskriver dataene i skjemaet
type JobAdDraft = {
  title: string;
  company: string;
  location: string;
  deadline: string;
  employmentType: string;
  applyUrl: string;
  contactEmail: string;
  description: string;
};

// Startverdier for skjemaet
const initial: JobAdDraft = {
  title: "",
  company: "",
  location: "",
  deadline: "",
  employmentType: "fulltime",
  applyUrl: "",
  contactEmail: "",
  description: "",
};

export default function NewJobAdPage() {
  const supabase = createClient();  // Database: oppretter Supabase-klient for å kommunisere med databasen

  // State som holder verdiene i skjemaet
  const [draft, setDraft] = useState<JobAdDraft>(initial);

  // State for å vise forhåndsvisning etter innsending
  const [submitted, setSubmitted] = useState<JobAdDraft | null>(null);

  // State for feilmelding ved validering
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // Beregner om skjemaet er gyldig
  const isValid = useMemo(() => {
    return (
      draft.title.trim().length > 0 &&
      draft.company.trim().length > 0 &&
      draft.deadline.trim().length > 0
    );
  }, [draft.title, draft.company, draft.deadline]);

  // Oppdaterer en spesifikk verdi i state
  function onChange<K extends keyof JobAdDraft>(key: K, value: JobAdDraft[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
  }

  // Håndterer innsending: validerer og lagrer til Supabase
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Vennligst fyll inn stillingstittel, bedrift og søknadsfrist.");
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase.from("job_postings").insert({
        title: draft.title.trim(),
        company: draft.company.trim(),
        description: draft.description.trim() || null,
        application_url: draft.applyUrl.trim() || null,
      });

      if (insertError) throw insertError;

      setSubmitted(draft);
      console.log("Jobbannonse lagret i Supabase:", draft);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Kunne ikke lagre jobbannonse i databasen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">


                                                  {/* UI (frontend) */}
      {/* Sideoverskrift */}
      <h1 className="text-2xl font-semibold">Opprett ny jobbannonse</h1>

      {/* Skjema for å opprette jobbannonse */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">

        {/* Viser feilmelding hvis validering feiler */}
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stillingstittel */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="title">
            Stillingstittel <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            className="w-full rounded border px-3 py-2"
            value={draft.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="f.eks. Junior utvikler"
          />
        </div>

        {/* Bedrift */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="company">
            Bedrift <span className="text-red-600">*</span>
          </label>
          <input
            id="company"
            className="w-full rounded border px-3 py-2"
            value={draft.company}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="f.eks. Acme AS"
          />
        </div>

        {/* Sted + Frist */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Sted */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="location">
              Sted
            </label>
            <input
              id="location"
              className="w-full rounded border px-3 py-2"
              value={draft.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="f.eks. Trondheim / Hybrid"
            />
          </div>

          {/* Søknadsfrist */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="deadline">
              Søknadsfrist <span className="text-red-600">*</span>
            </label>
            <input
              id="deadline"
              type="date"
              className="w-full rounded border px-3 py-2"
              value={draft.deadline}
              onChange={(e) => onChange("deadline", e.target.value)}
            />
          </div>
        </div>

        {/* Type stilling */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="employmentType">
            Type stilling
          </label>
          <select
            id="employmentType"
            className="w-full rounded border px-3 py-2"
            value={draft.employmentType}
            onChange={(e) => onChange("employmentType", e.target.value)}
          >
            <option value="fulltime">Heltid</option>
            <option value="parttime">Deltid</option>
            <option value="internship">Internship</option>
            <option value="temporary">Midlertidig</option>
          </select>
        </div>

        {/* Søknadslenke + Kontakt */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Søknadslenke */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="applyUrl">
              Søknadslenke
            </label>
            <input
              id="applyUrl"
              type="url"
              className="w-full rounded border px-3 py-2"
              value={draft.applyUrl}
              onChange={(e) => onChange("applyUrl", e.target.value)}
              placeholder="f.eks. https://bedrift.no/soknad"
            />
          </div>

          {/* Kontakt e-post */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="contactEmail">
              Kontakt e-post
            </label>
            <input
              id="contactEmail"
              type="email"
              className="w-full rounded border px-3 py-2"
              value={draft.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              placeholder="f.eks. hr@bedrift.no"
            />
          </div>
        </div>

        {/* Beskrivelse */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            Beskrivelse
          </label>
          <textarea
            id="description"
            className="w-full rounded border px-3 py-2"
            value={draft.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={6}
            placeholder="Beskriv arbeidsoppgaver, krav og hva dere tilbyr..."
          />
        </div>

        {/* Knapper */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded border px-4 py-2 disabled:opacity-50"
            disabled={!isValid || loading}  
          >
            Opprett jobbannonse
          </button>

          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={() => {
              // Tilbakestiller skjemaet
              // Fjerner preview og feilmelding
              setDraft(initial);
              setSubmitted(null);
              setError(null);
            }}
            disabled={loading}
          >
            Nullstill
          </button>
        </div>
      </form>

      {/* Viser JSON-forhåndsvisning av data etter innsending */}
      {submitted && (
        <section className="mt-8 rounded border p-4">
          <h2 className="text-lg font-medium">Forhåndsvisning</h2>
          <pre className="mt-3 overflow-auto rounded bg-gray-50 p-3 text-sm">
{JSON.stringify(submitted, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
