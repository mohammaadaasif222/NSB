"use client";

import Image from "next/image";
import { type DragEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { IMAGE_MIME_TYPES, IMAGE_SLOTS, type ImageSlot, type ImageSlotKey, imageTooSmall } from "@nsb/shared";
import { adminClient, RequestError } from "@/lib/admin-client";
import { CropDialog } from "./crop-dialog";
import { IconButton } from "./form";

const ACCEPT = IMAGE_MIME_TYPES.join(",");
const mb = (bytes: number) => `${Math.round((bytes / 1024 / 1024) * 10) / 10} MB`;

/**
 * Uploads made while a form is open. When the form closes (saved, cancelled or navigated away)
 * they are all sent to "discard": the API deletes the ones no record ended up using.
 */
export function useSessionUploads() {
  const urls = useRef<string[]>([]);
  useEffect(
    () => () => {
      adminClient.discardUploads(urls.current);
      urls.current = [];
    },
    [],
  );
  return useCallback((url: string) => void urls.current.push(url), []);
}

/** Checks type, size and minimum dimensions in the browser for quick feedback. The API checks again. */
async function precheck(file: File, slot: ImageSlotKey, maxBytes: number): Promise<string | null> {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) return "Choose a JPEG, PNG or WebP image.";
  if (file.size > maxBytes) return `This file is ${mb(file.size)}. Images must be ${mb(maxBytes)} or smaller.`;
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    const tooSmall = imageTooSmall(slot, width, height);
    if (tooSmall) return tooSmall;
  } catch {
    return "This file could not be read as an image.";
  }
  return null;
}

/** Checks and uploads one image to a slot; `onUploaded` records it for the form's cleanup. */
export function useUploader(slot: ImageSlotKey, maxBytes: number, onUploaded: (url: string) => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File): Promise<string | null> => {
    setError(null);
    const problem = await precheck(file, slot, maxBytes);
    if (problem) {
      setError(problem);
      return null;
    }
    setPending(true);
    try {
      const { url } = await adminClient.uploadImage(file, slot);
      onUploaded(url);
      return url;
    } catch (err) {
      setError(err instanceof RequestError ? err.message : "Upload failed. Please try again.");
      return null;
    } finally {
      setPending(false);
    }
  };
  return { upload, pending, error };
}

function SlotHint({ slot, maxBytes }: { slot: ImageSlotKey; maxBytes: number }) {
  const { recommended, min, anyOrientation }: ImageSlot = IMAGE_SLOTS[slot];
  return (
    <span className="text-xs font-normal text-zinc-500">
      {anyOrientation
        ? `Any shape works, wide or tall. At least ${min.width}×${min.height} px; ${recommended.width}×${recommended.height} px or larger looks sharpest. The site resizes it for you.`
        : `Recommended ${recommended.width}×${recommended.height} px (${recommended.ratio}).`}{" "}
      JPEG, PNG or WebP, up to {mb(maxBytes)}.
    </span>
  );
}

const dropFile = (e: DragEvent) => {
  e.preventDefault();
  return e.dataTransfer.files[0];
};

/** One image with preview, replace and remove. `value` is the saved URL (null for none). */
export function ImageUpload({
  label,
  slot,
  value,
  onChange,
  onUploaded,
  maxBytes,
  error: fieldError,
  crop = false,
}: {
  label: string;
  slot: ImageSlotKey;
  value: string | null;
  onChange: (url: string | null) => void;
  onUploaded: (url: string) => void;
  maxBytes: number;
  error?: string;
  /** Open the cropper on the chosen photo before it uploads. */
  crop?: boolean;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const { upload, pending, error } = useUploader(slot, maxBytes, onUploaded);
  const { width, height } = IMAGE_SLOTS[slot].recommended;
  const isIcon = slot === "category-icon";

  const [toCrop, setToCrop] = useState<File | null>(null);

  const send = async (file: File) => {
    const url = await upload(file);
    if (url) onChange(url);
  };
  const pick = async (file: File | undefined) => {
    if (!file || pending) return;
    if (crop) setToCrop(file);
    else await send(file);
  };

  return (
    <div className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
      {crop && (
        <CropDialog
          file={toCrop}
          onCancel={() => setToCrop(null)}
          onDone={async (file) => {
            await send(file);
            setToCrop(null);
          }}
        />
      )}
      <label htmlFor={inputId}>{label}</label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => pick(dropFile(e))}
        className={`relative overflow-hidden rounded-md border border-dashed border-zinc-300 bg-zinc-50 ${isIcon ? "size-28" : "w-full max-w-md"}`}
        style={isIcon ? undefined : { aspectRatio: `${width} / ${height}` }}
      >
        {value ? (
          <Image src={value} alt="" fill unoptimized sizes="448px" className={isIcon || slot === "footer-logo" ? "object-contain p-3" : "object-cover"} />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={pending}
            className="flex size-full flex-col items-center justify-center gap-1 text-xs font-normal text-zinc-500 hover:bg-zinc-100"
          >
            <ImagePlus className="size-6" aria-hidden />
            {isIcon ? "Upload" : "Click or drop an image"}
          </button>
        )}
        {pending && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 bg-white/80 text-xs text-zinc-700">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Uploading…
          </span>
        )}
      </div>
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {value && (
        <div className="flex gap-2 text-xs">
          <button type="button" disabled={pending} onClick={() => input.current?.click()} className="font-medium text-zinc-900 underline-offset-2 hover:underline">
            Replace
          </button>
          <button type="button" disabled={pending} onClick={() => onChange(null)} className="font-medium text-red-600 underline-offset-2 hover:underline">
            Remove
          </button>
        </div>
      )}
      <SlotHint slot={slot} maxBytes={maxBytes} />
      {(error ?? fieldError) && (
        <span role="alert" className="text-xs font-normal text-red-600">
          {error ?? fieldError}
        </span>
      )}
    </div>
  );
}

/** An ordered set of images (listing gallery): add several at once, reorder, remove. */
export function ImageListUpload({
  label,
  slot,
  value,
  onChange,
  onUploaded,
  maxBytes,
  max,
  crop = false,
}: {
  label: string;
  slot: ImageSlotKey;
  value: string[];
  onChange: (urls: string[]) => void;
  onUploaded: (url: string) => void;
  maxBytes: number;
  max: number;
  /** Crop each selected photo before upload. */
  crop?: boolean;
}) {
  const inputId = useId();
  const { upload, pending, error } = useUploader(slot, maxBytes, onUploaded);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  // Uploads finish one by one; each is appended and shown as soon as it is stored.
  const addFiles = async (files: File[]) => {
    const available = Math.max(0, max - value.length - (crop ? cropQueue.length : 0));
    const selected = files.slice(0, available);
    if (crop) {
      setCropQueue((queue) => [...queue, ...selected]);
      return;
    }
    let next = value;
    for (const file of selected) {
      const url = await upload(file);
      if (url) {
        next = [...next, url];
        onChange(next);
      }
    }
  };
  const move = (from: number, to: number) => {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2 text-sm font-medium text-zinc-700">
      {crop && (
        <CropDialog
          file={cropQueue[0] ?? null}
          allowOriginal={false}
          onCancel={() => setCropQueue([])}
          onDone={async (file) => {
            const url = await upload(file);
            if (url) onChange([...value, url]);
            setCropQueue((queue) => queue.slice(1));
          }}
        />
      )}
      <span>
        {label} <span className="font-normal text-zinc-500">({value.length}/{max})</span>
      </span>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {value.map((url, i) => (
          <li key={url} className="group relative aspect-video overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            <Image src={url} alt={`Photo ${i + 1}`} fill unoptimized sizes="200px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 px-1">
              <span className="flex">
                <IconButton label="Move left" disabled={pending || i === 0} onClick={() => move(i, i - 1)}>
                  <ArrowLeft className="size-3.5" aria-hidden />
                </IconButton>
                <IconButton label="Move right" disabled={pending || i === value.length - 1} onClick={() => move(i, i + 1)}>
                  <ArrowRight className="size-3.5" aria-hidden />
                </IconButton>
              </span>
              <IconButton label="Remove photo" disabled={pending} onClick={() => onChange(value.filter((u) => u !== url))} className="hover:text-red-600">
                <Trash2 className="size-3.5" aria-hidden />
              </IconButton>
            </div>
          </li>
        ))}
        {value.length < max && (
          <li
            className="relative aspect-video rounded-md border border-dashed border-zinc-300 bg-zinc-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void addFiles([...e.dataTransfer.files]);
            }}
          >
            <label
              htmlFor={inputId}
              className="flex size-full cursor-pointer flex-col items-center justify-center gap-1 text-xs font-normal text-zinc-500 hover:bg-zinc-100"
            >
              {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
              {pending ? "Uploading…" : "Add photos"}
            </label>
            <input
              id={inputId}
              type="file"
              accept={ACCEPT}
              multiple
              disabled={pending}
              className="sr-only"
              onChange={(e) => {
                void addFiles([...(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
          </li>
        )}
      </ul>
      <SlotHint slot={slot} maxBytes={maxBytes} />
      {error && (
        <span role="alert" className="text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
