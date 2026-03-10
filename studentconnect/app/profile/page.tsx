import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getUserAllergies } from "@/lib/supabase/database";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [profile, allergies] = await Promise.all([
    getUserProfile(user.id),
    getUserAllergies(user.id),
  ]);

  return (
    <ProfileClient
      email={profile?.email ?? user.email ?? ""}
      studyProgram={profile?.study_program ?? null}
      allergies={allergies}
      strikes={profile?.strikes ?? 0}
      bannedUntil={profile?.is_banned ?? null}
    />
  );
}
