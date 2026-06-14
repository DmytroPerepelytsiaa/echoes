import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/decisions"];
const AUTH_ROUTES = ["/login", "/signup"];

// Next.js 16 "proxy" convention (replaces the deprecated middleware.ts).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Optimistic cookie check only — real session validation happens in
  // server components and route handlers against the database.
  const hasSession = Boolean(getSessionCookie(request));

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/decisions/:path*", "/login", "/signup"],
};
