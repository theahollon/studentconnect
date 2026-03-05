"use client";

import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      <button
        onClick={() => setFilter("")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
          active === ""
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {EVENT_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => setFilter(type)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
            active === type
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
