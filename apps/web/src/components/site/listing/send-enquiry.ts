import { postJson } from "@/lib/site-client";

const FIELDS = ["name", "mobile", "email", "preferredDate", "budget", "message", "eventType"] as const;
export type EnquiryField = (typeof FIELDS)[number];
export type EnquiryErrors = Partial<Record<EnquiryField | "form", string>>;

/** Saves a lead tagged with a listing. Returns null once saved, otherwise what to show the visitor. */
export async function sendEnquiry(payload: Record<string, unknown>): Promise<EnquiryErrors | null> {
  try {
    const { res, error } = await postJson("/api/enquiries", payload);
    if (res.ok) return null;
    const errors: EnquiryErrors = {};
    for (const issue of error?.issues ?? []) {
      if (FIELDS.includes(issue.path as EnquiryField)) errors[issue.path as EnquiryField] ??= issue.message;
    }
    // Nothing to show beside a field (a 429, a 404, or an issue on the listing itself).
    if (!Object.keys(errors).length) {
      errors.form = res.status === 429 ? "Too many enquiries. Please try again shortly." : "Something went wrong. Please try again.";
    }
    return errors;
  } catch {
    return { form: "Could not send your enquiry. Check your connection and try again." };
  }
}
