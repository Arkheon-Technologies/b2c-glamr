import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/studio", "/my-bookings", "/profile"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Allow all requests through in development for preview
  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  // Check for the session cookie (set by the client after login)
  // We can't read localStorage in middleware (server-side), so we use a cookie
  // that the frontend sets alongside localStorage.
  const sessionCookie = request.cookies.get("glamr.auth.token");
  if (sessionCookie?.value) return NextResponse.next();

  // No cookie present — redirect to login, preserving the intended destination
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/studio/:path*", "/my-bookings/:path*", "/profile/:path*"],
};
