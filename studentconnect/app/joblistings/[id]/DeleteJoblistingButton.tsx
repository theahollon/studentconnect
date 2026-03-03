"use client";

import { deleteJoblisting } from "@/lib/supabase/database";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n/client";

export default function DeleteJoblistingButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    await deleteJoblisting(id);
    router.push("/joblistings");
  }

  return (
    <button
      onClick={handleDelete}
      className="mt-10 px-4 py-2 bg-red-600 text-white rounded"
    >
      {t("deleteJoblistingButton.label")}
    </button>
  );
}