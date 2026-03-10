// This component was developed with assistance from AI tools.

import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import CompanyList from "./companyList";
import { t } from "@/lib/i18n/server";

/**
 * Companies overview page at /admin/companies.
 *
 * Displays a list of all companies (via CompanyList).
 * If the current user is an admin, a "Create new company" button
 * linking to the company creation form is shown.
 */

export default async function CompaniesPage() {
  const admin = await isAdmin();

  const title = await t("companiesPage.heading");
  const createText = await t("companiesPage.createButton");

  return (
    <div className="mx-auto max-w-4xl px-6 text-center text-black">
      <h1 className="text-6xl font-bold text-black">{title}</h1>

      {admin && (
        <div className="mt-10">
          <Link
            href="/admin/companies/companyForm"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
          >
            {createText}
          </Link>
        </div>
      )}

      <div className="mt-8">
        <CompanyList />
      </div>
    </div>
  );
}