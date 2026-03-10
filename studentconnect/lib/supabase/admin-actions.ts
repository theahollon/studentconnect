"use server";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function promoteToAdminById(userId: string): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  if (error) return { error: error.message };
  return {};
}

export async function revokeAdmin(userId: string): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "user" })
    .eq("id", userId);

  if (error) return { error: error.message };
  return {};
}

// AI generated below:

export async function addStrike(userId: string): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("strikes")
    .eq("id", userId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const currentStrikes = profile?.strikes ?? 0;

  const { error } = await supabase
    .from("profiles")
    .update({ strikes: currentStrikes + 1 })
    .eq("id", userId);

  if (error) return { error: error.message };
  return {};
}

export async function removeStrike(userId: string): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("strikes")
    .eq("id", userId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const currentStrikes = profile?.strikes ?? 0;
  const nextStrikes = Math.max(currentStrikes - 1, 0);

  const { error } = await supabase
    .from("profiles")
    .update({ strikes: nextStrikes })
    .eq("id", userId);

  if (error) return { error: error.message };
  return {};
}

export async function banUserUntil(
  userId: string,
  bannedUntil: string
): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await createClient();

  const parsed = new Date(bannedUntil);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid ban date" };
  }
  if (parsed.getTime() <= Date.now()) {
    return { error: "Ban date must be in the future" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ banned_until: parsed.toISOString() })
    .eq("id", userId);

  if (error) return { error: error.message };
  return {};
}

export async function clearBan(userId: string): Promise<{ error?: string }> {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ banned_until: null })
    .eq("id", userId);

  if (error) return { error: error.message };
  return {};
}
