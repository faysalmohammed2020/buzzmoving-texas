// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  const isProd = process.env.NODE_ENV === "production";

  // ✅ 1) Force WWW only in production (prevents localhost issues)
  if (isProd && host === "movingquotetexas.com") {
    url.host = "www.movingquotetexas.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // ✅ 2) /home -> / (works in dev + prod)
  // If you want this only in production, wrap with: if (isProd && url.pathname === "/home") ...
  if (url.pathname === "/home") {
    url.pathname = "/";
    return NextResponse.redirect(url, 301);
  }

  // ✅ 3) Admin route protection (only runs for /admin)
  if (!url.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // user logged in check
  if (!token) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", url.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // redirect USER role away from admin
  if ((token as any).role === "USER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // block everyone except ADMIN
  if ((token as any).role !== "ADMIN") {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // ✅ Apply to all routes, but skip _next assets + api + common static files
    "/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
