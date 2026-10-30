import type { ApiErrorBody } from "@nsb/shared";

/** Server-side base URL of the NestJS API (container-to-container in production). */
const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** A server-side GET; `headers` adds to the defaults (the admin's session cookie). */
export async function apiGet<T>(path: string, headers?: HeadersInit): Promise<T> {
  const merged = new Headers(headers);
  merged.set("accept", "application/json");

  const res = await fetch(`${API_URL}${path}`, { headers: merged, cache: "no-store" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }
  return (await res.json()) as T;
}

/** Public endpoints, for server components. */
export const api = {
  get: <T>(path: string) => apiGet<T>(path),
};
