"use client";

import { useEffect, useRef, useState } from "react";
import { IMAGE_SLOTS } from "@nsb/shared";
import ReactCrop, { type Crop, type PixelCrop, makeAspectCrop, centerCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop as CropIcon, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./form";
import { Modal } from "./dialog";

/** Shapes offered when cropping; 16:9 matches the listing cards and the gallery's large photo. */
const ASPECTS = [
  { label: "Wide 16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "Square", value: 1 },
  { label: "Tall 3:4", value: 3 / 4 },
  { label: "Free", value: undefined },
];
const MAX_OUTPUT_EDGE = Math.max(IMAGE_SLOTS.listing.recommended.width, IMAGE_SLOTS.listing.recommended.height);
const fileIds = new WeakMap<File, string>();
let nextFileId = 0;

function keyForFile(file: File | null) {
  if (!file) return "closed";
  const existing = fileIds.get(file);
  if (existing) return existing;
  const id = String(++nextFileId);
  fileIds.set(file, id);
  return id;
}

function cropDimensions(
  imageSize: { naturalWidth: number; naturalHeight: number; width: number; height: number },
  crop: PixelCrop,
) {
  const scaleX = imageSize.naturalWidth / imageSize.width;
  const scaleY = imageSize.naturalHeight / imageSize.height;
  const width = crop.width * scaleX;
  const height = crop.height * scaleY;
  const scale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function drawCrop(image: HTMLImageElement, canvas: HTMLCanvasElement, crop: PixelCrop, maxEdge: number) {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;
  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not crop this image.");
  context.imageSmoothingQuality = "high";
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
}

/** Resizes the chosen area to the listing slot's recommended maximum and returns a JPEG file. */
async function cropToFile(image: HTMLImageElement, crop: PixelCrop, name: string): Promise<File> {
  const canvas = document.createElement("canvas");
  drawCrop(image, canvas, crop, MAX_OUTPUT_EDGE);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not create the cropped image.");
  return new File([blob], name.replace(/\.[^.]+$/, "") + "-cropped.jpg", { type: "image/jpeg" });
}

function initialCrop(image: HTMLImageElement, aspect: number | undefined): Crop {
  if (!aspect) return { unit: "%", x: 0, y: 0, width: 100, height: 100 };
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 100 }, aspect, image.naturalWidth, image.naturalHeight),
    image.naturalWidth,
    image.naturalHeight,
  );
}

/**
 * Pick the part of a photo to keep before it uploads: drag to move, zoom with the slider,
 * choose a shape. "Use whole photo" uploads it uncropped.
 */
interface CropDialogProps {
  file: File | null;
  onDone: (file: File) => void | Promise<void>;
  onCancel: () => void;
  allowOriginal?: boolean;
}

export function CropDialog(props: CropDialogProps) {
  return <CropDialogSession key={keyForFile(props.file)} {...props} />;
}

function CropDialogSession({ file, onDone, onCancel, allowOriginal = true }: CropDialogProps) {
  const [src, setSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [previewCrop, setPreviewCrop] = useState<PixelCrop | null>(null);
  const [sourceSize, setSourceSize] = useState<{ naturalWidth: number; naturalHeight: number; width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [maxCropWidth, setMaxCropWidth] = useState(100);
  const [aspect, setAspect] = useState<number | undefined>(ASPECTS[0].value);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const updateCrop = (nextCrop: Crop) => {
    setCrop(nextCrop);
    const image = imageRef.current;
    if (!image) return;
    const nextPixelCrop = convertToPixelCrop(nextCrop, image.width, image.height);
    setPixelCrop(nextPixelCrop);
    setPreviewCrop(nextPixelCrop);
  };

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const frame = requestAnimationFrame(() => setSrc(url));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = previewRef.current;
    if (!image || !canvas || !previewCrop) return;
    void Promise.resolve().then(() => drawCrop(image, canvas, previewCrop, 512)).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not preview this image.");
    });
  }, [previewCrop]);

  const outputSize = pixelCrop && sourceSize ? cropDimensions(sourceSize, pixelCrop) : null;

  const confirm = async () => {
    if (!file || !src || !pixelCrop || !imageRef.current) return;
    setBusy(true);
    try {
      await onDone(await cropToFile(imageRef.current, pixelCrop, file.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not crop this image.");
    } finally {
      setBusy(false);
    }
  };

  const uploadOriginal = async () => {
    if (!file) return;
    setBusy(true);
    try {
      await onDone(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload this image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!file} onClose={busy ? () => {} : onCancel} title="Crop image" size="lg">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1.6fr)_minmax(180px,1fr)]">
          <div className="flex h-[min(60vh,420px)] min-w-0 items-center justify-center overflow-hidden rounded-md bg-zinc-900">
            {src && (
              <ReactCrop
                crop={crop}
                aspect={aspect}
                onChange={(nextCrop, percentCrop) => {
                  setCrop(percentCrop);
                  setPixelCrop(nextCrop);
                  setPreviewCrop(nextCrop);
                }}
                onComplete={(nextCrop) => {
                  setPixelCrop(nextCrop);
                  setPreviewCrop(nextCrop);
                }}
                className="max-h-full max-w-full"
              >
                <img
                  ref={imageRef}
                  src={src}
                  alt="Adjust the crop area"
                  onLoad={(event) => {
                    const element = event.currentTarget;
                    setSourceSize({
                      naturalWidth: element.naturalWidth,
                      naturalHeight: element.naturalHeight,
                      width: element.width,
                      height: element.height,
                    });
                    const initial = initialCrop(element, aspect);
                    updateCrop(initial);
                    setMaxCropWidth(initial.width);
                  }}
                  className="block max-h-[min(60vh,420px)] max-w-full"
                />
              </ReactCrop>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium text-zinc-700">Live preview</span>
            <div className="flex min-h-36 flex-1 items-center justify-center overflow-hidden rounded-md bg-zinc-100 p-2">
              <canvas
                ref={previewRef}
                aria-label="Cropped image preview"
                role="img"
                className="max-h-[min(48vh,320px)] max-w-full"
              />
            </div>
            {pixelCrop && outputSize && (
              <span className="text-xs text-zinc-500">
                Saved as {outputSize.width}×{outputSize.height} px
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Shape">
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={busy}
              onClick={() => {
                setAspect(a.value);
                setZoom(1);
                const image = imageRef.current;
                if (image) {
                  const initial = initialCrop(image, a.value);
                  updateCrop(initial);
                  setMaxCropWidth(initial.width);
                }
              }}
              aria-pressed={aspect === a.value}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white"
            >
              {a.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-zinc-600">
            <ZoomOut className="size-4" aria-hidden />
            <span className="sr-only">Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              disabled={busy}
              onChange={(e) => {
                const value = Number(e.target.value);
                setZoom(value);
                const image = imageRef.current;
                if (crop && image) {
                  const width = Math.min(maxCropWidth, Math.max(15, maxCropWidth / value));
                  const height = aspect ? (width * image.width) / (aspect * image.height) : (width * crop.height) / crop.width;
                  const centerX = crop.x + crop.width / 2;
                  const centerY = crop.y + crop.height / 2;
                  updateCrop({
                    ...crop,
                    unit: "%",
                    x: Math.max(0, Math.min(100 - width, centerX - width / 2)),
                    y: Math.max(0, Math.min(100 - height, centerY - height / 2)),
                    width,
                    height,
                  });
                }
              }}
              className="w-32 accent-zinc-900"
            />
            <ZoomIn className="size-4" aria-hidden />
          </label>
        </div>
        <p className="text-xs text-zinc-500">
          Drag the crop area to reposition it and use its handles to resize. Choose a shape or adjust the zoom.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          {allowOriginal && (
            <Button variant="secondary" onClick={() => void uploadOriginal()} disabled={busy}>
              Use whole photo
            </Button>
          )}
          <Button onClick={() => void confirm()} pending={busy} disabled={!pixelCrop}>
            <CropIcon className="size-4" aria-hidden /> Crop and upload
          </Button>
        </div>
      </div>
    </Modal>
  );
}
