"use client";

import { deleteEvent } from "@/lib/supabase/database";
import { useRouter } from "next/navigation";

export default function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    await deleteEvent(id);
    router.push("/events");
  }

  return (
    <button
      onClick={handleDelete}
      className="mt-10 px-4 py-2 bg-red-600 text-white rounded"
    >
      Delete Event
    </button>
  );
}
