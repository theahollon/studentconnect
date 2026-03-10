"use server";

import { getCurrentUserId } from "@/lib/auth";
import { updateUserProfile, addUserAllergy, removeUserAllergy } from "@/lib/supabase/database";

export async function updateStudyProgram(study_program: string) {
  const userId = await getCurrentUserId();
  await updateUserProfile(userId, { study_program });
}

export async function addAllergy(allergy: string) {
  const userId = await getCurrentUserId();
  return await addUserAllergy(userId, allergy);
}

export async function deleteAllergy(allergyId: string) {
  await getCurrentUserId(); // ensures user is authenticated
  await removeUserAllergy(allergyId);
}
