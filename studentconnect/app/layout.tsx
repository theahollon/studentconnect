import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
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
          <div className="min-h-screen bg-gradient-to-br from-mint-50 to-mint-100">
            <nav className="w-full border-b border-b-foreground/10 h-16 bg-white">
              <div className="w-full max-w-5xl mx-auto flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href="/" className="hover:opacity-80 transition-opacity -ml-5">
                    <Image
                      src="/images/studentconnectrikitg.png"
                      alt="StudentConnect logo"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </Link>
                  <Link
                    href="/events"
                    className="hover:underline text-black"
                  >
                    Events
                  </Link>
                  <Link href="/jobs" className="hover:underline text-black">
                    Jobs
                  </Link>
                </div>
                <Suspense>
                  <AuthButton />
                </Suspense>
              </div>
            </nav>
            <div className="flex-1">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
