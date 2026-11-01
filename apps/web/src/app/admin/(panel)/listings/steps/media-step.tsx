"use client";

import Image from "next/image";
import { type Dispatch, memo, type SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { isYouTubeShortsLink, type ListingVideo, type ListingVideoKind, MAX_LISTING_VIDEOS, youTubeId } from "@nsb/shared";
import { Button, Field, IconButton, Select, TextInput } from "@/components/admin/form";
import { ImageListUpload, ImageUpload } from "@/components/admin/image-upload";
import { FormSection } from "@/components/admin/listing-fields";
import { sameStepProps } from "@/components/admin/use-stepped-form";
import type { ListingStepProps } from "../listing-draft";

const MAX_GALLERY = 30;

const KEYS = ["coverImageUrl"] as const;

export const MediaStep = memo(function MediaStep({
  values,
  hidden,
  errors,
  set,
  gallery,
  setGallery,
  videos,
  setVideos,
  trackUpload,
  maxUploadBytes,
}: ListingStepProps<(typeof KEYS)[number]> & {
  gallery: string[];
  setGallery: (urls: string[]) => void;
  videos: ListingVideo[];
  setVideos: Dispatch<SetStateAction<ListingVideo[]>>;
  trackUpload: (url: string) => void;
  maxUploadBytes: number;
}) {
  const setVideo = (i: number, patch: Partial<ListingVideo>) => setVideos((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const addVideo = (kind: ListingVideoKind) => setVideos((rows) => [...rows, { kind, url: "" }]);

  return (
    <div hidden={hidden} className="flex flex-col gap-5">
      <FormSection title="Photos">
        <ImageUpload
          label="Cover photo"
          slot="listing"
          crop
          value={values.coverImageUrl}
          onChange={(url) => set("coverImageUrl", url)}
          onUploaded={trackUpload}
          maxBytes={maxUploadBytes}
          error={errors.coverImageUrl}
        />
        <ImageListUpload
          label="Gallery"
          slot="listing"
          value={gallery}
          onChange={setGallery}
          onUploaded={trackUpload}
          maxBytes={maxUploadBytes}
          max={MAX_GALLERY}
        />
      </FormSection>

      <FormSection title="Videos">
        <p className="-mt-2 text-xs text-zinc-500">
          Paste YouTube links. Choose <b>Video</b> for a normal YouTube video (wide) or <b>Short</b> for a YouTube Short (tall). They show on
          the listing page in this order.
        </p>
        {videos.map((row, i) => {
          const id = youTubeId(row.url);
          const invalid = row.url.trim() !== "" && !id;
          const error = errors[`videos.${i}.url`] ?? (invalid ? "This isn't a YouTube link. Copy it from the Share button on YouTube." : undefined);
          return (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3">
              <div className={`relative shrink-0 overflow-hidden rounded bg-zinc-100 ${row.kind === "short" ? "h-20 w-12" : "h-12 w-20"}`}>
                {id && <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
                <Select aria-label={`Type of video ${i + 1}`} value={row.kind} onChange={(e) => setVideo(i, { kind: e.target.value as ListingVideoKind })}>
                  <option value="video">Video</option>
                  <option value="short">Short</option>
                </Select>
                <Field label={`YouTube link ${i + 1}`} hideLabel error={error}>
                  <TextInput
                    type="url"
                    inputMode="url"
                    placeholder={row.kind === "short" ? "https://youtube.com/shorts/…" : "https://youtu.be/…"}
                    value={row.url}
                    maxLength={300}
                    invalid={!!error}
                    onChange={(e) => {
                      const url = e.target.value;
                      // A /shorts/ link is always a Short; switch the type so it shows tall on the site.
                      setVideo(i, isYouTubeShortsLink(url) ? { url, kind: "short" } : { url });
                    }}
                  />
                </Field>
              </div>
              <IconButton label={`Remove video ${i + 1}`} onClick={() => setVideos((rows) => rows.filter((_, j) => j !== i))} className="mt-1 hover:text-red-600">
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            </div>
          );
        })}
        {videos.length < MAX_LISTING_VIDEOS ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => addVideo("video")}>
              <Plus className="size-4" aria-hidden /> Add video
            </Button>
            <Button variant="secondary" onClick={() => addVideo("short")}>
              <Plus className="size-4" aria-hidden /> Add Short
            </Button>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Up to {MAX_LISTING_VIDEOS} videos per listing.</p>
        )}
      </FormSection>
    </div>
  );
}, sameStepProps(KEYS));
