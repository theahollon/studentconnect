// This component was developed with support from AI tools.
// The code has been reviewed, understood, and adapted to the project’s needs.

"use client";

// React hooks
import { useMemo, useState, useEffect } from "react";

// Supabase client factory
import { createClient } from "@/lib/supabase/client";

/**
 * Type describing the job posting form data
 */
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

/**
 * Initial (empty) form state
 */
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

export default function JobAdForm() {
  // Create Supabase client instance
  const supabase = createClient();

  // Form state
  const [draft, setDraft] = useState<JobAdDraft>(initial);

  // Error message state
  const [error, setError] = useState<string | null>(null);

  // Loading state to prevent double submissions
  const [loading, setLoading] = useState(false);

  // Controls whether the success modal is mounted
  const [showAlert, setShowAlert] = useState(false);

  // Controls animation state (opacity / scale)
  const [alertVisible, setAlertVisible] = useState(false);

  /**
   * Handles modal animation when showAlert changes
   */
  useEffect(() => {
    if (showAlert) {
      // Small delay to allow CSS transitions to apply
      const id = setTimeout(() => setAlertVisible(true), 10);
      return () => clearTimeout(id);
    } else {
      setAlertVisible(false);
    }
  }, [showAlert]);

  /**
   * Closes the modal with a fade-out animation
   */
  function closeAlert() {
    setAlertVisible(false);
    // Unmount modal after animation completes
    setTimeout(() => setShowAlert(false), 200);
  }

  /**
   * Form validation:
   * Only required fields are checked here
   */
  const isValid = useMemo(() => {
    return (
      draft.title.trim().length > 0 &&
      draft.company.trim().length > 0 &&
      draft.deadline.trim().length > 0
    );
  }, [draft.title, draft.company, draft.deadline]);

  /**
   * Generic change handler for all form fields
   */
  function onChange<K extends keyof JobAdDraft>(key: K, value: JobAdDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Handles form submission:
   * - validates input
   * - inserts data into Supabase
   * - clears the form
   * - shows success modal
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!isValid) {
      setError("Please enter job title, company, and application deadline.");
      return;
    }

    // Prevent double submit while loading or while modal is open
    if (loading || showAlert) return;

    setLoading(true);

    try {
      // Prepare payload for database insert
      const payload = {
        title: draft.title.trim(),
        company: draft.company.trim(),
        description: draft.description.trim() || null,
        application_url: draft.applyUrl.trim() || null,
        // Optional fields can be added here if present in DB schema
      };

      // Insert job posting into Supabase
      const { error: insertError } = await supabase
        .from("job_postings")
        .insert(payload);

      if (insertError) throw insertError;

      // Reset form for next job posting
      setDraft(initial);

      // Show success modal
      setShowAlert(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Could not save job posting to the database.");
    } finally {
      setLoading(false);
    }
  }

  // Disable submit button if form is invalid or request is in progress
  const submitDisabled = !isValid || loading;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Create new job posting</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* Error message */}
        {error && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Job title */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="title">
            Job title <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            className="w-full rounded border px-3 py-2"
            value={draft.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="e.g. Junior developer"
            disabled={loading}
          />
        </div>

        {/* Company */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="company">
            Company <span className="text-red-600">*</span>
          </label>
          <input
            id="company"
            className="w-full rounded border px-3 py-2"
            value={draft.company}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="e.g. Acme AS"
            disabled={loading}
          />
        </div>

        {/* Location + deadline */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className="w-full rounded border px-3 py-2"
              value={draft.location}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="e.g. Trondheim / Hybrid"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="deadline">
              Application deadline <span className="text-red-600">*</span>
            </label>
            <input
              id="deadline"
              type="date"
              className="w-full rounded border px-3 py-2"
              value={draft.deadline}
              onChange={(e) => onChange("deadline", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Employment type */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="employmentType">
            Employment type
          </label>
          <select
            id="employmentType"
            className="w-full rounded border px-3 py-2"
            value={draft.employmentType}
            onChange={(e) => onChange("employmentType", e.target.value)}
            disabled={loading}
          >
            <option value="fulltime">Full-time</option>
            <option value="parttime">Part-time</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        {/* Application link + contact email */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="applyUrl">
              Application link
            </label>
            <input
              id="applyUrl"
              type="url"
              className="w-full rounded border px-3 py-2"
              value={draft.applyUrl}
              onChange={(e) => onChange("applyUrl", e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="contactEmail">
              Contact email
            </label>
            <input
              id="contactEmail"
              type="email"
              className="w-full rounded border px-3 py-2"
              value={draft.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="w-full rounded border px-3 py-2"
            value={draft.description}
            onChange={(e) => onChange("description", e.target.value)}
            rows={6}
            disabled={loading}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded border px-4 py-2 disabled:opacity-50"
            disabled={submitDisabled}
          >
            {loading ? "Creating..." : "Create job posting"}
          </button>

          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={() => {
              setDraft(initial);
              setError(null);
              closeAlert();
            }}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Success modal with fade & scale animation */}
      {showAlert && (
        <div
          className={[
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200",
            alertVisible ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0",
          ].join(" ")}
          onClick={closeAlert}
        >
          <div
            className={[
              "w-full max-w-sm rounded-lg bg-white p-6 shadow-xl transition-all duration-200",
              alertVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Success</h3>
            <p className="mt-2 text-sm text-gray-600">
              Your job posting has been successfully created.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
                onClick={closeAlert}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


