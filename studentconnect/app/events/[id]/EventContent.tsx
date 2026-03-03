import { getEventById } from "@/lib/supabase/database";
import { notFound } from "next/navigation";
import DeleteEventButton from "./DeleteEventButton";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getLocale, t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

export default async function EventContent(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const eventData = await getEventById(id);
  if (!eventData) return notFound();

  const event = eventData;

  const locale = await getLocale();
  const dateLocale = locale === "it" ? "it-IT" : "en-GB";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isRegistered = false;

  if (user) {
    const { data } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .maybeSingle();

    isRegistered = !!data;
  }

  async function register() {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("event_registrations").insert({
      event_id: event.id,
      user_id: user.id,
    });

    if (error) throw error;

    revalidatePath(`/events/${event.id}`);
  }

  async function withdraw() {
    "use server";
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", event.id)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath(`/events/${event.id}`);
  }

  const registerText = await t("eventContent.register");
  const withdrawText = await t("eventContent.withdraw");
  const admin = await isAdmin();

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold text-gray-900">{event.title}</h1>

      <p className="text-gray-500 mt-2">
        {new Date(event.start_time).toLocaleString(dateLocale)}
      </p>

      <p className="mt-6 text-lg text-gray-700 break-words">
        {event.description}
      </p>

      {user && (
        <form action={isRegistered ? withdraw : register} className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isRegistered ? withdrawText : registerText}
          </button>
        </form>
      )}

      {admin && <DeleteEventButton id={event.id} />}
    </div>
  );
}