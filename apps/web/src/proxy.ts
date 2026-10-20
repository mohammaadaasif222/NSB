import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@nsb/shared";

/**
 * Optimistic admin gate: only checks that a session cookie exists.
 * The admin layout verifies the session with the API on every request.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/logout") return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isLogin = pathname === "/admin/login";

  if (!hasSession && !isLogin) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
