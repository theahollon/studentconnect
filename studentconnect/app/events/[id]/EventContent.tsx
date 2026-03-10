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
  let isBannedFromEvents = false;

  if (user) {
    const [{ data: registration }, { data: profile }] = await Promise.all([
      supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("banned_until")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    isRegistered = !!registration;

    if (profile?.banned_until) {
      isBannedFromEvents = new Date(profile.banned_until).getTime() > Date.now();
    }
  }

  async function register() {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("banned_until")
      .eq("id", user.id)
      .maybeSingle();

    const isBanned =
      !!profile?.banned_until &&
      new Date(profile.banned_until).getTime() > Date.now();

    if (isBanned) {
      return;
    }

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
  const bannedMessage = await t("eventContent.bannedFromEvents");
  const admin = await isAdmin();

  const showDisabledRegister = user && !isRegistered && isBannedFromEvents;

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold text-gray-900">{event.title}</h1>

      <p className="mt-2 text-gray-500">
        {new Date(event.start_time).toLocaleString(dateLocale)}
      </p>

      <p className="mt-6 break-words text-lg text-gray-700">
        {event.description}
      </p>

      <p className="mt-4 text-sm text-gray-500">{event.location}</p>

      {event.event_type && (
        <span className="mt-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {event.event_type}
        </span>
      )}

      {user && (
        <div className="mt-6">
          {showDisabledRegister ? (
            <div className="flex flex-col items-start gap-2">
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded bg-gray-300 px-4 py-2 text-white opacity-70"
              >
                {registerText}
              </button>
              <p className="text-sm font-medium text-red-600">
                {bannedMessage}
              </p>
            </div>
          ) : (
            <form action={isRegistered ? withdraw : register}>
              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {isRegistered ? withdrawText : registerText}
              </button>
            </form>
          )}
        </div>
      )}

      {admin && <DeleteEventButton id={event.id} />}
    </div>
  );
}