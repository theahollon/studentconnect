"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@/lib/i18n/client";

const EVENT_TYPES = ["general", "social", "sports", "academic"] as const;

export default function EventsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("type") ?? "";

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    router.push(`/events?${params.toString()}`);
  }

  return (
    <div className="inline-flex flex-wrap justify-center gap-2 rounded-full border border-white/60 bg-white/65 p-2 shadow-sm">
      <button
        onClick={() => setFilter("")}
        className={`rounded-full px-5 py-2 text-sm font-medium transition ${
          active === ""
            ? "bg-white text-gray-950 shadow-[0_6px_18px_rgba(15,23,42,0.14)]"
            : "text-gray-600 hover:bg-white/70"
        }`}
      >
        {t("filter.all")}
      </button>
      {EVENT_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => setFilter(type)}
          className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
            active === type
              ? "bg-white text-gray-950 shadow-[0_6px_18px_rgba(15,23,42,0.14)]"
              : "text-gray-600 hover:bg-white/70"
          }`}
        >
          {t(`activityForm.categories.${type}`)}
        </button>
      ))}
    </div>
  );
}
