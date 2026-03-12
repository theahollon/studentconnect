import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAdminList, getNonAdminList } from "@/lib/supabase/database";
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

  const [admins, nonAdmins] = await Promise.all([getAdminList(), getNonAdminList()]);

  // Backfill email for the current user if missing in profiles
  if (user?.email) {
    const currentProfile = admins.find((a) => a.id === user.id);
    if (currentProfile && !currentProfile.email) {
      await supabase.from("profiles").update({ email: user.email }).eq("id", user.id);
      currentProfile.email = user.email;
    }
  }

  return (
    <ManageAdminsForm
      admins={admins}
      nonAdmins={nonAdmins}
      currentUserId={user?.id ?? ""}
    />
  );
}
