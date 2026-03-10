// This component was developed with support from AI tools.
// The code has been reviewed, understood, and adapted to the project’s needs.

"use client"; // Ensures the component runs on the client (Next.js App Router)

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Supabase client factory
import { t } from "@/lib/i18n/client";

/**
 * TypeScript type describing the activity form fields
 */
type ActivityDraft = {
  title: string;
  description: string;
  startsAt: string; // datetime-local input string
  location: string;
  capacity: string; // kept as string because HTML inputs return strings
  category: string;
  company: string;
};

/**
 * Initial (empty) form values
 */
const initial: ActivityDraft = {
  title: "",
  description: "",
  startsAt: "",
  location: "",
  capacity: "",
  category: "general",
  company: "",
};

export default function ActivityForm() {
  // Create Supabase client instance for database operations
  const supabase = createClient();

  // Form state (all input values)
  const [draft, setDraft] = useState<ActivityDraft>(initial);

  // Holds a validation / submission error message (if any)
  const [error, setError] = useState<string | null>(null);

  // Loading state used to disable UI while the request is running
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal mount/unmount state (controls whether modal exists in the DOM)
  const [showAlert, setShowAlert] = useState(false);

  // Animation state for modal transitions (opacity/scale)
  const [alertVisible, setAlertVisible] = useState(false);

  // Companies loaded from database for the dropdown
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  /**
   * Fetch available companies on mount
   */
  useEffect(() => {
    supabase
      .from("companies")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setCompanies(data);
      });
  }, [supabase]);

  /**
   * Basic form validation:
   * Title and date/time are required
   */
  const isValid = useMemo(() => {
    return draft.title.trim().length > 0 && draft.startsAt.trim().length > 0;
  }, [draft.title, draft.startsAt]);

  /**
   * Runs fade/scale-in animation when the modal is mounted.
   * When showAlert becomes true, we set alertVisible on the next tick.
   */
  useEffect(() => {
    if (showAlert) {
      // Small delay so Tailwind transitions apply correctly
      const id = setTimeout(() => setAlertVisible(true), 10);
      return () => clearTimeout(id);
    } else {
      setAlertVisible(false);
    }
  }, [showAlert]);

  /**
   * Closes the success modal with a fade-out animation.
   * First we animate out (alertVisible=false), then unmount (showAlert=false).
   */
  function closeAlert() {
    setAlertVisible(false);
    setTimeout(() => setShowAlert(false), 200); // duration must match the CSS transition time
  }

  /**
   * Generic input handler for updating a single field in the form state
   */
  function onChange<K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Handles form submission:
   * - validates required fields
   * - inserts the activity into Supabase
   * - clears the form so the user can create a new activity immediately
   * - shows a success modal with smooth animation
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!isValid) {
      setError(t("activityForm.validationRequired"));
      return;
    }

    // Prevent double-submit while request is in-flight or modal is open
    if (isSubmitting || showAlert) return;

    try {
      // Lock the UI while saving
      setIsSubmitting(true);

      // Convert datetime-local value to ISO format for database storage
      const startTimeIso = new Date(draft.startsAt).toISOString();

      // Insert row into the "events" table in Supabase
      const { error: insertError } = await supabase.from("events").insert({
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        location: draft.location.trim() || null,
        start_time: startTimeIso,
        end_time: null,
        company: draft.company || null,
        // Note: capacity/category are currently only UI fields.
        // Add corresponding DB columns and include them here if needed.
      });

      if (insertError) throw insertError;

      // Clear the form so a new activity can be created without refreshing
      setDraft(initial);

      // Open success modal
      setShowAlert(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? t("activityForm.saveError"));
    } finally {
      // Unlock the UI
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      {/* Page heading */}
      <h1 className="text-2xl font-semibold">{t("activityForm.heading")}</h1>

      {/* Activity creation form */}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* Display error message when validation or DB insert fails */}
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Title (required) */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="title">
            {t("activityForm.fields.title")} <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            className="w-full rounded border px-3 py-2"
            value={draft.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder={t("activityForm.placeholders.title")}
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            {t("activityForm.fields.description")}
          </label>
          <textarea
            id="description"
            className="w-full rounded border px-3 py-2"
            value={draft.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={4}
            placeholder={t("activityForm.placeholders.description")}
            disabled={isSubmitting}
          />
        </div>

        {/* Date/time (required) + location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="startsAt">
              {t("activityForm.fields.dateTime")} <span className="text-red-600">*</span>
            </label>
            <input
              id="startsAt"
              type="datetime-local"
              className="w-full rounded border px-3 py-2"
              value={draft.startsAt}
              onChange={(e) => onChange("startsAt", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="location">
              {t("activityForm.fields.location")}
            </label>
            <input
              id="location"
              className="w-full rounded border px-3 py-2"
              value={draft.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder={t("activityForm.placeholders.location")}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Company dropdown */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="company">
            {t("activityForm.fields.company")}
          </label>
          <select
            id="company"
            className="w-full rounded border px-3 py-2"
            value={draft.company}
            onChange={(e) => onChange("company", e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">{t("activityForm.placeholders.company")}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Capacity + category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="capacity">
              {t("activityForm.fields.spots")}
            </label>
            <input
              id="capacity"
              type="number"
              min={1}
              className="w-full rounded border px-3 py-2"
              value={draft.capacity}
              onChange={(e) => onChange("capacity", e.target.value)}
              placeholder={t("activityForm.placeholders.spots")}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="category">
              {t("activityForm.fields.category")}
            </label>
            <select
              id="category"
              className="w-full rounded border px-3 py-2"
              value={draft.category}
              onChange={(e) => onChange("category", e.target.value)}
              disabled={isSubmitting}
            >
              <option value="general">{t("activityForm.categories.general")}</option>
              <option value="social">{t("activityForm.categories.social")}</option>
              <option value="sports">{t("activityForm.categories.sports")}</option>
              <option value="academic">{t("activityForm.categories.academic")}</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded border px-4 py-2 disabled:opacity-50"
            // Disable submit while saving or when the form is invalid
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? t("activityForm.buttons.saving") : t("activityForm.buttons.create")}
          </button>

          <button
            type="button"
            className="rounded border px-4 py-2 disabled:opacity-50"
            // Prevent reset while saving to avoid inconsistent state
            disabled={isSubmitting}
            onClick={() => {
              // Reset form values and clear error message
              // Also closes the modal if it is open
              setDraft(initial);
              setError(null);
              closeAlert();
            }}
          >
            {t("activityForm.buttons.reset")}
          </button>
        </div>
      </form>

      {/* Animated success modal (fade + scale) */}
      {showAlert && (
        <div
          className={[
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200",
            alertVisible ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0",
          ].join(" ")}
          // Click outside the modal closes it
          onClick={closeAlert}
        >
          <div
            className={[
              "w-full max-w-sm rounded-lg bg-white p-6 shadow-xl transition-all duration-200",
              alertVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
            ].join(" ")}
            // Prevent closing when clicking inside the modal content
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">{t("activityForm.modal.title")}</h3>
            <p className="mt-2 text-sm text-gray-600">
              {t("activityForm.modal.body")}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                onClick={closeAlert}
              >
                {t("activityForm.modal.ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
