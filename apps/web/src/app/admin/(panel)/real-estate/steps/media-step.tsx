"use client";

import { memo } from "react";
import { Plus } from "lucide-react";
import { PROJECT_LIMITS } from "@nsb/shared";
import { Button, Field, TextArea, TextInput } from "@/components/admin/form";
import { ImageListUpload } from "@/components/admin/image-upload";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import { type ProjectStepProps, videoError } from "../project-draft";

const KEYS = ["photos", "videoUrl", "videoChapters", "videos"] as const;

function Chapters({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <details className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5" open={!!value.trim()}>
      <summary className="cursor-pointer text-sm font-semibold">{label}</summary>
      <TextArea rows={3} maxLength={2000} value={value} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(e.target.value)} />
      <span className="mt-1 block text-xs text-zinc-500">One chapter per line: the start time, then its title.</span>
    </details>
  );
}

export const MediaStep = memo(function MediaStep({
  values: d,
  hidden,
  errors,
  edit: { set, setRow, addRow, removeRow },
  trackUpload,
  maxUploadBytes,
}: ProjectStepProps<(typeof KEYS)[number]> & { trackUpload: (url: string) => void; maxUploadBytes: number }) {
  return (
    <div hidden={hidden} className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500">
        First photo is the cover. Crop each photo with a live preview before upload. Up to {PROJECT_LIMITS.photos} photos; the page shows a gallery
        of 5 and a “Show all photos” view.
      </p>
      <ImageListUpload
        label="Photos"
        slot="listing"
        crop
        value={d.photos}
        onChange={(urls) => set("photos", urls)}
        onUploaded={trackUpload}
        maxBytes={maxUploadBytes}
        max={PROJECT_LIMITS.photos}
      />
      <Field label="Main video (project reel or walkthrough)" hint="A YouTube link. Plays first on the page. No video? The Videos tab stays hidden." error={errors.videoUrl ?? videoError(d.videoUrl)}>
        <TextInput type="url" inputMode="url" value={d.videoUrl} maxLength={300} placeholder="https://youtube.com/…" onChange={(e) => set("videoUrl", e.target.value)} />
      </Field>
      <Chapters label="Add chapters for the main video (optional)" value={d.videoChapters} onChange={(v) => set("videoChapters", v)} placeholder={"0:00 Entrance and elevation\n2:10 Clubhouse and pool"} />
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-semibold">More videos (optional, up to {PROJECT_LIMITS.videos})</span>
        {d.videos.map((v, i) => (
          <div key={i} className="a-hc">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <TextInput value={v.title} maxLength={80} placeholder="Sample flat tour" onChange={(e) => setRow("videos", i, { title: e.target.value })} />
              </Field>
              <Field label="Video link" error={errors[`videos.${i}.url`] ?? videoError(v.url)}>
                <TextInput type="url" inputMode="url" value={v.url} maxLength={300} placeholder="https://youtube.com/…" onChange={(e) => setRow("videos", i, { url: e.target.value })} />
              </Field>
            </div>
            <Chapters label="Chapters (optional)" value={v.chapters} onChange={(c) => setRow("videos", i, { chapters: c })} placeholder="0:00 Living room" />
            <Button variant="secondary" className="self-start" onClick={() => removeRow("videos", i)}>
              Remove
            </Button>
          </div>
        ))}
        {d.videos.length < PROJECT_LIMITS.videos && (
          <Button variant="secondary" className="self-start" onClick={() => addRow("videos", { title: "", url: "", chapters: "" })}>
            <Plus className="size-4" aria-hidden /> Add another video
          </Button>
        )}
      </div>
    </div>
  );
}, sameStepProps(KEYS));
