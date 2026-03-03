"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { promoteToAdminById, revokeAdmin } from "@/lib/supabase/admin-actions";
import { t } from "@/lib/i18n/client";

type Profile = { id: string; role: string; email?: string };

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
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  async function handlePromote(userId: string) {
    setError(null);
    setSuccess(null);
    setLoadingId(userId);
    const result = await promoteToAdminById(userId);
    setLoadingId(null);
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
    setLoadingId(userId);
    const result = await revokeAdmin(userId);
    setLoadingId(null);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(t("adminManage.revokeSuccess"));
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("adminManage.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("adminManage.subtitle")}</p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠ {error}
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ {success}
        </div>
      )}

      {/* Regular users */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">{t("adminManage.users")}</h2>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {nonAdmins.length}
          </span>
        </div>

        {nonAdmins.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
            {t("adminManage.noUsers")}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {nonAdmins.map((user) => (
              <li key={user.id} className="flex items-center justify-between px-4 py-3">
                <span className="truncate text-sm text-gray-600">{user.email ?? user.id}</span>
                <button
                  onClick={() => handlePromote(user.id)}
                  disabled={loadingId === user.id}
                  className="ml-4 flex-shrink-0 rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-700 transition hover:bg-pink-100 disabled:opacity-50"
                >
                  {loadingId === user.id ? "…" : t("adminManage.promote")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Current admins */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">{t("adminManage.currentAdmins")}</h2>
          <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-700">
            {admins.length}
          </span>
        </div>

        {admins.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
            {t("adminManage.noAdmins")}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
            {admins.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm text-gray-600">{admin.id}</span>
                  {admin.id === currentUserId && (
                    <span className="flex-shrink-0 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-600">
                      You
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRevoke(admin.id)}
                  disabled={admin.id === currentUserId || loadingId === admin.id}
                  title={admin.id === currentUserId ? t("adminManage.cannotRevokeSelf") : undefined}
                  className="ml-4 flex-shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loadingId === admin.id ? "…" : t("adminManage.revoke")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
