import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@nsb/shared";
import { apiGet } from "@/lib/api";

/** For ids taken from the URL, so malformed ones become a 404 instead of an API 400. */
export const isUuid = (value: string | undefined): value is string =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/** Admin endpoints; forwards the visitor's session cookie. Server components only. */
export const adminApi = {
  get: async <T>(path: string) => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return apiGet<T>(path, token ? { cookie: `${SESSION_COOKIE}=${token}` } : undefined);
  },
};
