//AI generated component

"use client";

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n/client";

type Locale = "en" | "it";

function setLocaleCookie(locale: Locale) {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function getLocaleCookie(): Locale {
  const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(en|it)/);
  return (m?.[1] as Locale) || "en";
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    setChecked(getLocaleCookie() === "it");
  }, []);

  const onToggle = () => {
    const next: Locale = checked ? "en" : "it";
    setChecked(!checked);
    setLocaleCookie(next);
    router.refresh();
  };

  if (!mounted) {
    return <div className="h-[38px] w-[104px] rounded-full border" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
      aria-pressed={checked}
      aria-label={t("languageSwitcher.ariaLabel")}
    >
      <span className="text-black">EN</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? "bg-pink-600" : "bg-gray-300"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-4" : "translate-x-1"}`} />
      </span>
      <span className="text-black">IT</span>
    </button>
  );
}
