"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { promoteToAdminById, revokeAdmin } from "@/lib/supabase/admin-actions";
import { t } from "@/lib/i18n/client";

type Profile = { id: string; role: string };

export default function ManageAdminsForm({
  admins,
  nonAdmins,
  currentUserId,
}: {
  admins: Profile[];
  nonAdmins: Profile[];
  currentUserId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handlePromote(userId: string) {
    setError(null);
    setSuccess(null);
    const result = await promoteToAdminById(userId);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(t("adminManage.promoteSuccess"));
      router.refresh();
    }
  }

  async function handleRevoke(userId: string) {
    setError(null);
    setSuccess(null);
    const result = await revokeAdmin(userId);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(t("adminManage.revokeSuccess"));
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{t("adminManage.title")}</h1>

      {error && (
        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Non-admin users */}
      <section className="mt-6">
        <h2 className="text-lg font-medium">{t("adminManage.users")}</h2>
        {nonAdmins.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("adminManage.noUsers")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {nonAdmins.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded border px-4 py-2"
              >
                <span className="text-sm">{user.id}</span>
                <button
                  className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
                  onClick={() => handlePromote(user.id)}
                >
                  {t("adminManage.promote")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Current admins */}
      <section className="mt-8">
        <h2 className="text-lg font-medium">{t("adminManage.currentAdmins")}</h2>
        {admins.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t("adminManage.noAdmins")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {admins.map((admin) => (
              <li
                key={admin.id}
                className="flex items-center justify-between rounded border px-4 py-2"
              >
                <span className="text-sm">{admin.id}</span>
                <button
                  className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => handleRevoke(admin.id)}
                  disabled={admin.id === currentUserId}
                  title={
                    admin.id === currentUserId
                      ? t("adminManage.cannotRevokeSelf")
                      : undefined
                  }
                >
                  {t("adminManage.revoke")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
