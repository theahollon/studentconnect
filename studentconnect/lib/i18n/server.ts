//AI generated

import "server-only";
import { cookies } from "next/headers";

import en from "@/public/locales/en/common.json";
import it from "@/public/locales/it/common.json";

type Dict = Record<string, string>;
type Locale = "en" | "it";

const dicts: Record<Locale, Dict> = { en, it };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get("NEXT_LOCALE")?.value;
  return v === "it" ? "it" : "en";
}

export async function t(key: string): Promise<string> {
  const locale = await getLocale();
  return dicts[locale][key] ?? key;
}