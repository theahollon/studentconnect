import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/components/auth-button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Suspense } from "react";
import "./globals.css";

import { t } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/auth";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "StudentConnect",
  description: "The fastest way to build connect on campus",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <RootShell>{children}</RootShell>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}

async function RootShell({ children }: { children: React.ReactNode }) {
  // ✅ cookies()/t() happens INSIDE Suspense
  const navEvents = await t("rootNav.events");
  const navJobs = await t("rootNav.jobs");
  const navManageAdmins = await t("rootNav.manageAdmins");
  const admin = await isAdmin();

  return (
    <div className="min-h-screen bg-pink-200">
      <nav className="w-full border-b border-b-foreground/10 bg-white shadow-sm">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-6 py-6 gap-4">
          <div className="flex gap-8 items-center flex-1">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <Image
                src="/images/StudentConnect2.png"
                alt="StudentConnect logo"
                width={180}
                height={180}
                className="object-contain"
              />
            </Link>

            <div className="flex gap-6 items-center font-semibold text-lg">
              <Link
                href="/events"
                className="hover:underline text-black transition-colors hover:text-pink-600"
              >
                {navEvents}
              </Link>
              <Link
                href="/joblistings"
                className="hover:underline text-black transition-colors hover:text-pink-600"
              >
                {navJobs}
              </Link>
              {admin && (
                <Link
                  href="/admin/manage-admins"
                  className="hover:underline text-black transition-colors hover:text-pink-600"
                >
                  {navManageAdmins}
                </Link>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
          </div>

          <div className="flex-shrink-0 ml-4">
            <Suspense fallback={null}>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </nav>

      <div className="flex-1">{children}</div>
    </div>
  );
}