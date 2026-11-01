import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { adminApi } from "@/lib/admin-api";
import { PUBLIC_DATA_TAG } from "@/lib/api";

/** After an admin save, so the public site shows it on its next request instead of within a minute. */
export async function POST() {
  try {
    await adminApi.get("/auth/me");
  } catch {
    return new NextResponse(null, { status: 401 });
  }
  revalidateTag(PUBLIC_DATA_TAG, { expire: 0 });
  return new NextResponse(null, { status: 204 });
}
