import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";
import { useRouter } from "next/navigation"; // Importer router for språkbytte
import "./globals.css";

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
  const router = useRouter(); // Bruk router for å håndtere språkbytte

  const switchLanguage = (lang: string) => {
    router.push(`/${lang}`); // Bytt språk ved å oppdatere URL-en
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
                      Events
                    </Link>
                    <Link
                      href="/joblistings"
                      className="hover:underline text-black transition-colors hover:text-pink-600"
                    >
                      Jobs
                    </Link>
                  </div>
                </div>
                {/* Språkvelger-knapper */}
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => switchLanguage("en")}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded"
                  >
                    English
                  </button>
                  <button
                    onClick={() => switchLanguage("it")}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black rounded"
                  >
                    Italiano
                  </button>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <Suspense>
                    <AuthButton />
                  </Suspense>
                </div>
              </div>
            </nav>
            <div className="flex-1">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}