import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAdminList } from "@/lib/supabase/admin-actions";
import ManageAdminsForm from "./ManageAdminsForm";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ManageAdminsShell />
    </Suspense>
  );
}

async function ManageAdminsShell() {
  // 🔒 Only admins can access this page
  await requireAdmin();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admins = await getAdminList();

  return <ManageAdminsForm admins={admins} currentUserId={user?.id ?? ""} />;
}
