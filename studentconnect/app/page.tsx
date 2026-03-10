import Link from "next/link";
import { t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

export default async function Home() {
  const admin = await isAdmin();
  const title = await t("home.title");
  const subtitle = await t("home.subtitle");

  const cardEventsTitle = await t("home.cards.events.title");
  const cardEventsBody = await t("home.cards.events.body");

  const cardJobsTitle = await t("home.cards.jobs.title");
  const cardJobsBody = await t("home.cards.jobs.body");

  const cardManageAdminsTitle = await t("home.cards.admins.title");

  const cardManageCompaniesTitle = await t("home.cards.companies.title");
  const cardManageCompaniesBody = await t("home.cards.companies.body");

  return (
    <main className="flex-1">
      <section className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12 bg-pink-200 p-8 rounded-lg">
          <h1 className="text-5xl font-bold mb-4 text-black">{title}</h1>
          <p className="text-xl mb-8 text-black">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            href="/events"
            className="group p-8 bg-white backdrop-blur-sm border border-gray-300 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-3 text-black group-hover:text-gray-800">
                📅 {cardEventsTitle}
              </h3>
              <p className="text-black">{cardEventsBody}</p>
            </div>
          </Link>

          <Link
            href="/joblistings"
            className="group p-8 bg-white backdrop-blur-sm border border-gray-300 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-3 text-black group-hover:text-gray-800">
                💼 {cardJobsTitle}
              </h3>
              <p className="text-black">{cardJobsBody}</p>
            </div>
          </Link>
          {admin && (
            <Link
              href="/admin/manage-admins"
              className="group p-8 bg-white backdrop-blur-sm border border-gray-300 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-3 text-black group-hover:text-gray-800">
                  👑 {cardManageAdminsTitle}
                </h3>
                <p className="text-black">
                  {cardManageAdminsTitle}
                </p>
              </div>
            </Link>
          )}
          
          <Link
              href="/admin/companies"
              className="group p-8 bg-white backdrop-blur-sm border border-gray-300 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-3 text-black group-hover:text-gray-800">
                  💵 {cardManageCompaniesTitle}
                </h3>
                <p className="text-black">
                  {cardManageCompaniesBody}
                </p>
              </div>
            </Link>

        </div>
      </section>
    </main>
  );
}