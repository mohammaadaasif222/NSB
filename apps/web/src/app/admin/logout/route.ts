import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@nsb/shared";

/** Clears the session cookie. POST from the logout button; GET when a session has expired. */
function logout() {
  // A relative Location keeps the browser on its own origin. Behind Caddy, request.url carries the
  // container's bind address (https://0.0.0.0:3000), so an absolute URL built from it is unreachable.
  // 303 so a POST is followed by a GET of the login page.
  const response = new NextResponse(null, { status: 303, headers: { Location: "/admin/login" } });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const GET = logout;
export const POST = logout;
