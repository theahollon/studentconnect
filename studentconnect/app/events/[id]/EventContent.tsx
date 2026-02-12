import { getEventById } from "@/lib/supabase/database";
import { notFound } from "next/navigation";
import DeleteEventButton from "./DeleteEventButton";

export default async function EventContent(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const event = await getEventById(id);

  if (!event) return notFound();

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold">{event.title}</h1>

      <p className="text-gray-500 mt-2">
        {new Date(event.start_time).toLocaleString()}
      </p>

      <p className="mt-6 text-lg">
        {event.description}
      </p>

      <DeleteEventButton id={event.id} />
    </div>
  );
}
