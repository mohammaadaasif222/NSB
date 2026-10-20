"use client";

import { useState } from "react";
import { BadgeCheck, Pencil, Star, Trash2 } from "lucide-react";
import { type ListingReview, REVIEW_SOURCES, type ReviewInput, type ReviewSource } from "@nsb/shared";
import { adminClient } from "@/lib/admin-client";
import { Button, Field, IconButton, Select, TextArea, TextInput, Toggle } from "./form";
import { useAdminAction } from "./use-admin-action";

const SOURCE_LABELS: Record<ReviewSource, string> = { google: "From Google", customer: "Customer (given to NSB)" };

interface Draft {
  authorName: string;
  rating: string;
  text: string;
  reviewDate: string;
  source: ReviewSource;
  isVerified: boolean;
}

const EMPTY: Draft = { authorName: "", rating: "5", text: "", reviewDate: "", source: "google", isVerified: true };
const toDraft = (r: ListingReview): Draft => ({ ...r, rating: String(r.rating), reviewDate: r.reviewDate ?? "" });

/**
 * A listing's reviews, added by hand: copy real reviews from the vendor's Google profile, or add
 * ones customers gave NSB. Nothing is generated; the site shows exactly these.
 */
export function ReviewsManager({ listingId, initial }: { listingId: string; initial: ListingReview[] }) {
  const { run, pending } = useAdminAction();
  const [reviews, setReviews] = useState(initial);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const start = (target: ListingReview | "new") => {
    setErrors({});
    setDraft(target === "new" ? EMPTY : toDraft(target));
    setEditing(target === "new" ? "new" : target.id);
  };

  /** From the Save button or Enter in a field; stops the event so the listing form around it is not submitted. */
  async function save(e: { preventDefault(): void; stopPropagation(): void }) {
    e.preventDefault();
    e.stopPropagation();
    const body: ReviewInput = { ...draft, rating: Number(draft.rating), reviewDate: draft.reviewDate || null };
    const result = await run(
      () =>
        editing === "new"
          ? adminClient.post<ListingReview>(`/admin/listings/${listingId}/reviews`, body)
          : adminClient.patch<ListingReview>(`/admin/reviews/${editing}`, body),
      { success: editing === "new" ? "Review added" : "Review saved", refresh: false },
    );
    if (!result.ok) {
      setErrors(result.error.fieldErrors);
      return;
    }
    const saved = result.data;
    setReviews((list) => (editing === "new" ? [saved, ...list] : list.map((r) => (r.id === saved.id ? saved : r))));
    setEditing(null);
  }

  async function remove(review: ListingReview) {
    const result = await run(() => adminClient.delete(`/admin/reviews/${review.id}`), { success: "Review deleted", refresh: false });
    if (result.ok) setReviews((list) => list.filter((r) => r.id !== review.id));
  }

  const form = (
    // A <div> with an explicit submit handler: nested <form> elements are not allowed in HTML.
    <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3" onKeyDown={(e) => e.key === "Enter" && e.target instanceof HTMLInputElement && void save(e)}>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1.4fr]">
        <Field label="Reviewer name *" error={errors.authorName}>
          <TextInput value={draft.authorName} maxLength={80} onChange={(e) => set("authorName", e.target.value)} invalid={!!errors.authorName} />
        </Field>
        <Field label="Stars *" error={errors.rating}>
          <Select value={draft.rating} onChange={(e) => set("rating", e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date of review" error={errors.reviewDate}>
          <TextInput type="date" value={draft.reviewDate} onChange={(e) => set("reviewDate", e.target.value)} />
        </Field>
      </div>
      <Field label="Review" error={errors.text}>
        <TextArea value={draft.text} rows={3} maxLength={2000} onChange={(e) => set("text", e.target.value)} />
      </Field>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Source">
            <Select value={draft.source} onChange={(e) => set("source", e.target.value as ReviewSource)}>
              {REVIEW_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="pb-2">
            <Toggle label='Show "Verified" badge' showLabel checked={draft.isVerified} onChange={(v) => set("isVerified", v)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(null)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={(e) => void save(e)} pending={pending}>
            {editing === "new" ? "Add review" : "Save review"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {reviews.length === 0 && editing === null && <p className="text-sm text-zinc-500">No reviews yet. The listing page shows a Reviews section once you add one.</p>}
      <ul className="flex flex-col gap-2">
        {reviews.map((r) =>
          editing === r.id ? (
            <li key={r.id}>{form}</li>
          ) : (
            <li key={r.id} className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-zinc-900">
                  {r.authorName}
                  <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${r.rating} stars`}>
                    {Array.from({ length: r.rating }, (_, i) => (
                      <Star key={i} className="size-3.5 fill-current" aria-hidden />
                    ))}
                  </span>
                  {r.isVerified && <BadgeCheck className="size-4 text-emerald-600" aria-label="Verified" />}
                  <span className="text-xs font-normal text-zinc-500">
                    {SOURCE_LABELS[r.source]}
                    {r.reviewDate && ` · ${r.reviewDate}`}
                  </span>
                </p>
                {r.text && <p className="mt-1 line-clamp-2 text-zinc-600">{r.text}</p>}
              </div>
              <IconButton label={`Edit review by ${r.authorName}`} onClick={() => start(r)}>
                <Pencil className="size-4" aria-hidden />
              </IconButton>
              <IconButton label={`Delete review by ${r.authorName}`} onClick={() => void remove(r)} className="hover:text-red-600">
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </li>
          ),
        )}
      </ul>
      {editing === "new" ? form : editing === null && (
        <Button variant="secondary" className="self-start" onClick={() => start("new")}>
          <Star className="size-4" aria-hidden /> Add review
        </Button>
      )}
    </div>
  );
}
