import en from "@/public/locales/en/common.json";
import it from "@/public/locales/it/common.json";

type Dict = Record<string, string>;
type Locale = "en" | "it";

const dicts: Record<Locale, Dict> = { en, it };

export function getLocale(): Locale {
  // This module should only be used from client components,
  // but it can still be evaluated during SSR/bundling.
  if (typeof document === "undefined") return "en";

  const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=(en|it)/);
  return (m?.[1] as Locale) || "en";
}

export function t(key: string): string {
  const locale = getLocale();
  return dicts[locale][key] ?? key;
}