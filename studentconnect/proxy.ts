import { updateSession } from "@/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

const locales = ["en", "it"] as const;
type Locale = (typeof locales)[number];

function getLocale(pathname: string): Locale | null {
  const seg = pathname.split("/")[1];
  return (locales as readonly string[]).includes(seg) ? (seg as Locale) : null;
}

function stripLocalePrefix(pathname: string, locale: Locale) {
  const stripped = pathname.replace(`/${locale}`, "");
  return stripped === "" ? "/" : stripped;
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  const res = await updateSession(request);

  const locale = getLocale(pathname);
  if (locale) {
    res.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    const nextUrl = url.clone();
    nextUrl.pathname = stripLocalePrefix(pathname, locale);

    const rewriteRes = NextResponse.rewrite(nextUrl);

    res.headers.forEach((value, key) => {
      rewriteRes.headers.set(key, value);
    });

    rewriteRes.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return rewriteRes;
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};