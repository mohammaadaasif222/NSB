import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@nsb/shared";
import { PATH_HEADER } from "@/lib/location";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminGate(request);

  // Site pages: tell server components which page they render, so the location applies only
  // to the page it was chosen on (lib/location-server.ts). Set here, it cannot be spoofed.
  const headers = new Headers(request.headers);
  headers.set(PATH_HEADER, pathname);
  return NextResponse.next({ request: { headers } });
}

/**
 * Optimistic admin gate: only checks that a session cookie exists.
 * The admin layout verifies the session with the API on every request.
 */
function adminGate(request: NextRequest) {
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
  // Pages only: not the API proxy, Next's assets or files such as images.
  matcher: ["/((?!api/|_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
