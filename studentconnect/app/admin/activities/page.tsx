import { requireAdmin } from "@/lib/auth";
import ActivityForm from "./ActivityForm";
import { Suspense } from "react";

export default async function Page() {
  return (
    <Suspense fallback={<p>Checking permissions…</p>}>
      <AdminGuardWrapper />
    </Suspense>
  );
}

async function AdminGuardWrapper() {
  await requireAdmin(); // 🔒 Only admins can access this page
  return <ActivityForm />;
}
