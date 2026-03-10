// This component was developed with assistance from AI tools.

import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import CompanyForm from "./companyForm";
import { t } from "@/lib/i18n/server";

/**
 * Admin-only page wrapper for the company creation form.
 *
 * Requires admin authentication before rendering the CompanyForm.
 * Uses Suspense for the async admin check.
 */


export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <AdminCompaniesPage />
    </Suspense>
  );
}

async function AdminCompaniesPage() {
  await requireAdmin(); // Only admins can access this page

  const heading = await t("companyForm.heading");

  return (
    <div>
      <CompanyForm />
    </div>
  );
}