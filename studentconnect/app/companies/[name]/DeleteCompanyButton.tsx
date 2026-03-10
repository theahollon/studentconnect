// This component was developed with assistance from AI tools.

"use client";

import { deleteCompanyProfile } from "@/lib/supabase/database";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n/client";

/**
 * Client component that renders a delete button for a company profile.
 *
 * Visible only to admins. Deletes the company from the database
 * and redirects to the companies list page.
 *
 * @param props.id - The UUID of the company to delete.
 */

export default function DeleteCompanyButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    await deleteCompanyProfile(id);
    router.push("/admin/companies");
  }

  return (
    <button
      onClick={handleDelete}
      className="mt-10 px-4 py-2 bg-red-600 text-white rounded"
    >
      {t("deleteCompanyProfileButton.label")}
    </button>
  );
}
