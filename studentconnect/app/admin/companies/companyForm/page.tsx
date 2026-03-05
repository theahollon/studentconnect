import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import CompanyForm from "./companyForm";
import { t } from "@/lib/i18n/server";


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