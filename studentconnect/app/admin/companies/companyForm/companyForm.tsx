// This component was developed with assistance from AI tools.

"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n/client";

/**
 * Admin form for creating a new company profile.
 *
 * Inserts a row into the "companies" table in Supabase.
 * Name is required; description and website URL are optional.
 * Shows a success modal on successful creation.
 */

type CompanyDraft = {
  name: string;
  description: string;
  website_url: string;
};

const initial: CompanyDraft = {
  name: "",
  description: "",
  website_url: "",
};

export default function CompanyForm() {
  const supabase = createClient();

  const [draft, setDraft] = useState<CompanyDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const isValid = useMemo(() => {
    return draft.name.trim().length > 0;
  }, [draft.name]);

  useEffect(() => {
    if (showAlert) {
      const id = setTimeout(() => setAlertVisible(true), 10);
      return () => clearTimeout(id);
    } else {
      setAlertVisible(false);
    }
  }, [showAlert]);

  function closeAlert() {
    setAlertVisible(false);
    setTimeout(() => setShowAlert(false), 200);
  }

  function onChange<K extends keyof CompanyDraft>(key: K, value: CompanyDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValid) {
      setError(t("companyForm.validationRequired"));
      return;
    }

    if (isSubmitting || showAlert) return;

    try {
      setIsSubmitting(true);

      const { error: insertError } = await supabase.from("companies").insert({
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        website_url: draft.website_url.trim() || null,
      });

      if (insertError) throw insertError;

      setDraft(initial);
      setShowAlert(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? t("companyForm.saveError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{t("companyForm.heading")}</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Company name (required) */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="name">
            {t("companyForm.fields.name")} <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            className="w-full rounded border px-3 py-2"
            value={draft.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder={t("companyForm.placeholders.name")}
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            {t("companyForm.fields.description")}
          </label>
          <textarea
            id="description"
            className="w-full rounded border px-3 py-2"
            value={draft.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={4}
            placeholder={t("companyForm.placeholders.description")}
            disabled={isSubmitting}
          />
        </div>

        {/* Website URL */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="website_url">
            {t("companyForm.fields.websiteUrl")}
          </label>
          <input
            id="website_url"
            type="url"
            className="w-full rounded border px-3 py-2"
            value={draft.website_url}
            onChange={(e) => onChange("website_url", e.target.value)}
            placeholder={t("companyForm.placeholders.websiteUrl")}
            disabled={isSubmitting}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? t("companyForm.buttons.saving") : t("companyForm.buttons.create")}
          </button>

          <button
            type="button"
            onClick={() => {
              setDraft(initial);
              setError(null);
            }}
            disabled={isSubmitting}
            className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("companyForm.buttons.reset")}
          </button>
        </div>
      </form>

      {/* Success modal */}
      {showAlert && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
            alertVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeAlert}
        >
          <div
            className={`w-full max-w-sm rounded-xl bg-white p-6 shadow-xl transition-all duration-200 ${
              alertVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold">{t("companyForm.modal.title")}</h2>
            <p className="mt-2 text-sm text-gray-600">{t("companyForm.modal.body")}</p>
            <button
              onClick={closeAlert}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t("companyForm.modal.ok")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}