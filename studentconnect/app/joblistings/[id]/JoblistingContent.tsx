import { getJoblistingById } from "@/lib/supabase/database";
import { notFound } from "next/navigation";
import DeleteJoblistingButton from "./DeleteJoblistingButton";

export default async function JoblistingContent(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const joblisting = await getJoblistingById(id);

  if (!joblisting) return notFound();

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold text-gray-900">{joblisting.title}</h1>

    {/*
      <p className="text-gray-500 mt-2">
        {new Date(joblisting.start_time).toLocaleString()}
      </p>
      */}

      <p className="mt-6 text-lg text-gray-700 break-words">
        {joblisting.description}
      </p>

      <DeleteJoblistingButton id={joblisting.id} />
    </div>
  );
}
