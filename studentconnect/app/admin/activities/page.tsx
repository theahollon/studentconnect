// Denne komponenten er utviklet med støtte fra KI-verktøy.
// Koden er gjennomgått, forstått og tilpasset prosjektets behov.

"use client"; // Sørger for at komponenten kjøres på klienten

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Database: importerer funksjon for å lage Supabase-klient

// TypeScript-type som beskriver dataene i skjemaet
type ActivityDraft = {
  title: string;
  description: string;
  startsAt: string;
  location: string;
  capacity: string;
  category: string;
};

// Startverdier for skjemaet
const initial: ActivityDraft = {
  title: "",
  description: "",
  startsAt: "",
  location: "",
  capacity: "",
  category: "general",
};

export default function NewActivityPage() {
  const supabase = createClient();      // Database: oppretter Supabase-klient for å kommunisere med databasen
  
  // State som holder verdiene i skjemaet
  const [draft, setDraft] = useState<ActivityDraft>(initial);

  // State for å vise forhåndsvisning etter innsending
  const [submitted, setSubmitted] = useState<ActivityDraft | null>(null);

  // State for feilmelding ved validering
  const [error, setError] = useState<string | null>(null);

  // Beregner om skjemaet er gyldig
  const isValid = useMemo(() => {
    return draft.title.trim().length > 0 && draft.startsAt.trim().length > 0;
  }, [draft.title, draft.startsAt]);

  // Oppdaterer en spesifikk verdi i skjemaets state
  function onChange<K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) {
    setDraft((p) => ({ ...p, [key]: value }));
  }

// Håndterer innsending: validerer og lagrer til Supabase
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError("Vennligst fyll inn tittel og dato/tid.");
      return;
    }

    try {
      const startTimeIso = new Date(draft.startsAt).toISOString();

      const { error: insertError } = await supabase.from("events").insert({  //Database: data insert i "events" tabellen i Supabase  
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        location: draft.location.trim() || null,
        start_time: startTimeIso,
        end_time: null,
      });

      if (insertError) throw insertError;

      setSubmitted(draft);
      console.log("Event lagret i Supabase:", draft);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Kunne ikke lagre event i databasen.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">

                                
                                
                                
                                             {/* UI (frontend) */}


      {/* Sideoverskrift */}
      <h1 className="text-2xl font-semibold">Opprett ny aktivitet</h1>

      {/* Skjema for å opprette aktivitet */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        
        {/* Viser feilmelding hvis validering feiler */}
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Tittel */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="title">
            Tittel <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            className="w-full rounded border px-3 py-2"
            value={draft.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="f.eks. Brettspillkveld"
          />
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
            rows={4}
            placeholder="Kort beskrivelse av aktiviteten..."
          />
        </div>

        {/* Dato/tid og sted */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="startsAt">
              Dato og tid <span className="text-red-600">*</span>
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              className="w-full rounded border px-3 py-2"
              value={draft.startsAt}
              onChange={(e) => onChange("startsAt", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="location">
              Sted
            </label>
            <input
              id="location"
              className="w-full rounded border px-3 py-2"
              value={draft.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="f.eks. Rom A-201"
            />
          </div>
        </div>

        {/* Kapasitet og kategori */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="capacity">
              Antall plasser
            </label>
            <input
              id="capacity"
              type="number"
              min={1}
              className="w-full rounded border px-3 py-2"
              value={draft.capacity}
              onChange={(e) => onChange("capacity", e.target.value)}
              placeholder="f.eks. 30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="category">
              Kategori
            </label>
            <select
              id="category"
              className="w-full rounded border px-3 py-2"
              value={draft.category}
              onChange={(e) => onChange("category", e.target.value)}
            >
              <option value="general">Generelt</option>
              <option value="social">Sosialt</option>
              <option value="sports">Sport</option>
              <option value="academic">Faglig</option>
            </select>
          </div>
        </div>

        {/* Knapper */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded border px-4 py-2 disabled:opacity-50"
            disabled={!isValid}
          >
            Opprett aktivitet
          </button>

          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={() => {
              // Tilbakestiller skjemaet til startverdier
              // Fjerner preview og feilmelding
              setDraft(initial);
              setSubmitted(null);
              setError(null);
            }}
          >
            Nullstill
          </button>
        </div>
      </form>

      {/* Viser en JSON-forhåndsvisning av data etter innsending */}
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