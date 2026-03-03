
// All code below is generated using AI
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// use for hiding buttons
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (profile) {
    // Backfill email if missing
    if (!profile.email && user.email) {
      await supabase.from("profiles").update({ email: user.email }).eq("id", user.id);
    }
    return profile.role === "admin";
  }

  // Fallback: create profile if it doesn't exist
  const role = user.user_metadata?.role === "admin" ? "admin" : "user";
  await supabase.from("profiles").upsert({ id: user.id, role, email: user.email ?? "" });
  return role === "admin";
}

// use for restricting access to pages
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/unauthorized");
  }
}
