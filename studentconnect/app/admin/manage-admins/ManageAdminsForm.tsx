"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  promoteToAdminById,
  revokeAdmin,
  addStrike,
  removeStrike,
  banUserUntil,
  clearBan,
} from "@/lib/supabase/admin-actions";
import { t } from "@/lib/i18n/client";

type Profile = {
  id: string;
  role: string;
  email?: string;
  strikes: number;
  banned_until: string | null;
};

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
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [banInputs, setBanInputs] = useState<Record<string, string>>({});
  const router = useRouter();

  function isCurrentlyBanned(bannedUntil: string | null) {
    if (!bannedUntil) return false;
    return new Date(bannedUntil).getTime() > Date.now();
  }

  function formatBanDate(bannedUntil: string | null) {
    if (!bannedUntil) return null;
    const date = new Date(bannedUntil);
    if (Number.isNaN(date.getTime())) return bannedUntil;
    return date.toLocaleString();
  }

  function mapErrorMessage(errorMessage: string) {
    if (errorMessage === "invalid_ban_date") {
      return t("adminManage.invalidBanDate");
    }

    if (errorMessage === "ban_date_must_be_future") {
      return t("adminManage.banDateMustBeFuture");
    }

    return errorMessage;
  }

  async function runAction(
    key: string,
    action: () => Promise<{ error?: string }>,
    successMessage: string
  ) {
    setError(null);
    setSuccess(null);
    setLoadingKey(key);

    const result = await action();

    setLoadingKey(null);

    if (result.error) {
      setError(mapErrorMessage(result.error));
    } else {
      setSuccess(successMessage);
      router.refresh();
    }
  }

  async function handlePromote(userId: string) {
    await runAction(
      `promote-${userId}`,
      () => promoteToAdminById(userId),
      t("adminManage.promoteSuccess")
    );
  }

  async function handleRevoke(userId: string) {
    await runAction(
      `revoke-${userId}`,
      () => revokeAdmin(userId),
      t("adminManage.revokeSuccess")
    );
  }

  async function handleAddStrike(userId: string) {
    await runAction(
      `add-strike-${userId}`,
      () => addStrike(userId),
      t("adminManage.addStrikeSuccess")
    );
  }

  async function handleRemoveStrike(userId: string) {
    await runAction(
      `remove-strike-${userId}`,
      () => removeStrike(userId),
      t("adminManage.removeStrikeSuccess")
    );
  }

  async function handleBan(userId: string) {
    const value = banInputs[userId];

    if (!value) {
      setError(t("adminManage.banDateRequired"));
      return;
    }

    await runAction(
      `ban-${userId}`,
      () => banUserUntil(userId, value),
      t("adminManage.banSuccess")
    );
  }

  async function handleClearBan(userId: string) {
    await runAction(
      `clear-ban-${userId}`,
      () => clearBan(userId),
      t("adminManage.clearBanSuccess")
    );
  }

  function renderUserRow(user: Profile, showPromote: boolean, showRevoke: boolean) {
    const banned = isCurrentlyBanned(user.banned_until);
    const formattedBanDate = formatBanDate(user.banned_until);

    return (
      <li key={user.id} className="px-5 py-5">
        <div className="flex flex-col gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-base font-semibold text-gray-800">
                {user.email ?? user.id}
              </span>

              {user.id === currentUserId && (
                <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                  {t("adminManage.you")}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                {t("adminManage.strikes")}: {user.strikes ?? 0}
              </span>

              {banned ? (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-red-700">
                  {t("adminManage.bannedUntil")} {formattedBanDate}
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-700">
                  {t("adminManage.notBanned")}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-3">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-yellow-800">
                {t("adminManage.strikeSection")}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAddStrike(user.id)}
                  disabled={loadingKey === `add-strike-${user.id}`}
                  className="rounded-lg bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-800 transition hover:bg-yellow-200 disabled:opacity-50"
                >
                  {loadingKey === `add-strike-${user.id}` ? "…" : t("adminManage.addStrike")}
                </button>

                <button
                  onClick={() => handleRemoveStrike(user.id)}
                  disabled={loadingKey === `remove-strike-${user.id}`}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingKey === `remove-strike-${user.id}` ? "…" : t("adminManage.removeStrike")}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-pink-200 bg-pink-50/60 p-3">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-pink-800">
                {t("adminManage.adminSection")}
              </p>

              <div className="flex flex-wrap gap-2">
                {showPromote && (
                  <button
                    onClick={() => handlePromote(user.id)}
                    disabled={loadingKey === `promote-${user.id}`}
                    className="rounded-lg bg-pink-100 px-3 py-2 text-xs font-semibold text-pink-800 transition hover:bg-pink-200 disabled:opacity-50"
                  >
                    {loadingKey === `promote-${user.id}` ? "…" : t("adminManage.promote")}
                  </button>
                )}

                {showRevoke && (
                  <button
                    onClick={() => handleRevoke(user.id)}
                    disabled={user.id === currentUserId || loadingKey === `revoke-${user.id}`}
                    title={user.id === currentUserId ? t("adminManage.cannotRevokeSelf") : undefined}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loadingKey === `revoke-${user.id}` ? "…" : t("adminManage.revoke")}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/40 p-3">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-red-800">
                {t("adminManage.banSection")}
              </p>

              <div className="flex flex-col gap-2">
                <input
                  type="datetime-local"
                  value={banInputs[user.id] ?? ""}
                  onChange={(e) =>
                    setBanInputs((prev) => ({
                      ...prev,
                      [user.id]: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBan(user.id)}
                    disabled={loadingKey === `ban-${user.id}`}
                    className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-800 transition hover:bg-red-200 disabled:opacity-50"
                  >
                    {loadingKey === `ban-${user.id}` ? "…" : t("adminManage.setBan")}
                  </button>

                  <button
                    onClick={() => handleClearBan(user.id)}
                    disabled={loadingKey === `clear-ban-${user.id}`}
                    className="rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-800 transition hover:bg-green-200 disabled:opacity-50"
                  >
                    {loadingKey === `clear-ban-${user.id}` ? "…" : t("adminManage.clearBan")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("adminManage.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("adminManage.subtitle")}</p>
      </div>

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
            {nonAdmins.map((user) => renderUserRow(user, true, false))}
          </ul>
        )}
      </section>

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
            {admins.map((admin) => renderUserRow(admin, false, true))}
          </ul>
        )}
      </section>
    </div>
  );
}