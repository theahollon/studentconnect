import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import ActivityForm from "./ActivityForm";
import { t } from "@/lib/i18n/server";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <AdminActivitiesShell />
    </Suspense>
  );
}

async function AdminActivitiesShell() {
  // 🔒 Only admins can access this page
  await requireAdmin();

  // ✅ Inside Suspense -> safe to call t() (cookies())
  const checkingText = await t("admin.activities.checkingPermissions");

  return (
    <Suspense fallback={<p>{checkingText}</p>}>
      <ActivityForm />
    </Suspense>
  );
}