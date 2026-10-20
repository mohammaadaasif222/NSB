import type { ApiErrorBody, ImageSlotKey, UploadedImage } from "@nsb/shared";

/**
 * Browser-side calls to the admin API. Requests go to /api on this origin (Caddy in production,
 * a Next rewrite in development), so the httpOnly session cookie is sent automatically.
 * Server components use lib/api.ts instead.
 */

export class RequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly issues: NonNullable<ApiErrorBody["issues"]> = [],
  ) {
    super(message);
  }

  /** Validation messages keyed by field path, e.g. { heading: "This field is required" }. */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries(this.issues.map((i) => [i.path, i.message]));
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body === undefined || isForm ? undefined : { "content-type": "application/json" },
      body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new RequestError(0, "Could not reach the server. Check your connection.");
  }

  if (res.status === 401) {
    // Session expired: /admin/logout is a route handler that clears the cookie and redirects to
    // sign in, so it needs a full document request rather than a client-side navigation.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/admin/logout");
    throw new RequestError(401, "Your session has expired. Please sign in again.");
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as ApiErrorBody | null;
    // Server errors are logged by the API; the details are not for the browser.
    const message =
      res.status === 413
        ? "That file is too large."
        : res.status >= 500 && res.status !== 502 && res.status !== 503
          ? "Something went wrong. Please try again."
          : (err?.message ?? res.statusText);
    throw new RequestError(res.status, message, err?.issues);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const adminClient = {
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: (path: string) => request<void>("DELETE", path),

  uploadImage(file: File, slot: ImageSlotKey): Promise<UploadedImage> {
    const form = new FormData();
    form.append("file", file);
    return request<UploadedImage>("POST", `/admin/uploads?slot=${slot}`, form);
  },

  /** Deletes uploads a form no longer needs; the API keeps any that a record still uses. */
  discardUploads(urls: string[]): void {
    if (urls.length) request("POST", "/admin/uploads/discard", { urls }).catch(() => {});
  },
};
