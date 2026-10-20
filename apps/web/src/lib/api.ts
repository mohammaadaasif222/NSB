import { cookies } from "next/headers";
import { type ApiErrorBody, SESSION_COOKIE } from "@nsb/shared";

/** Server-side base URL of the NestJS API (container-to-container in production). */
const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000/api";

/** For ids taken from the URL, so malformed ones become a 404 instead of an API 400. */
export const isUuid = (value: string | undefined): value is string =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, { auth = false } = {}): Promise<T> {
  const headers = new Headers({ accept: "application/json" });
  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) headers.set("cookie", `${SESSION_COOKIE}=${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { headers, cache: "no-store" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }
  return (await res.json()) as T;
}

/** Public endpoints, for server components. */
export const api = {
  get: <T>(path: string) => request<T>(path),
};

/** Admin endpoints; forwards the visitor's session cookie. Server components only. */
export const adminApi = {
  get: <T>(path: string) => request<T>(path, { auth: true }),
};
