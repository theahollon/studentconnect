import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import JobAdForm from "./JobAdForm";
import { t } from "@/lib/i18n/server";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <AdminJobsPage />
    </Suspense>
  );
}

async function AdminJobsPage() {
  await requireAdmin(); // 🔒 Only admins can access this page

  const heading = await t("jobAdForm.heading");

  return (
    <div>

      <JobAdForm />
    </div>
  );
}