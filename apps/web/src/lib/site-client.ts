import type { ApiErrorBody } from "@nsb/shared";

/**
 * Posts a public form to the API. `error` is the API's error body when the request was refused (null
 * if it could not be read). A network failure rejects, so each form keeps its own connection message.
 */
export async function postJson(path: string, payload: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const error = res.ok ? null : ((await res.json().catch(() => null)) as ApiErrorBody | null);
  return { res, error };
}
