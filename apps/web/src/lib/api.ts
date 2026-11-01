import type { ApiErrorBody } from "@nsb/shared";

/** Server-side base URL of the NestJS API (container-to-container in production). */
export const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000/api";

/** A page gives up on a stuck API and shows its error page instead of hanging. */
const TIMEOUT_MS = 10_000;

/** Tags every cached public response, so an admin save can clear them all (app/admin/revalidate). */
export const PUBLIC_DATA_TAG = "public-data";

/** How long a public response is reused when nothing clears it first. */
const PUBLIC_CACHE_SECONDS = 60;

type Freshness = Pick<RequestInit, "cache" | "next">;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** A server-side GET; `headers` adds to the defaults (the admin's session cookie). Uncached unless `freshness` says so. */
export async function apiGet<T>(path: string, headers?: HeadersInit, freshness: Freshness = { cache: "no-store" }): Promise<T> {
  const merged = new Headers(headers);
  merged.set("accept", "application/json");

  const res = await fetch(`${API_URL}${path}`, { headers: merged, ...freshness, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }
  return (await res.json()) as T;
}

/** Public endpoints, for server components. Only 200 responses are cached. */
export const api = {
  get: <T>(path: string, seconds = PUBLIC_CACHE_SECONDS) => apiGet<T>(path, undefined, { next: { revalidate: seconds, tags: [PUBLIC_DATA_TAG] } }),
};
