"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop, makeAspectCrop, centerCrop, cropToCanvas } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop as CropIcon, ZoomIn } from "lucide-react";
import { Button } from "./form";
import { Modal } from "./dialog";

/** Shapes offered when cropping; 16:9 matches the listing cards and the gallery's large photo. */
const ASPECTS = [
  { label: "Wide 16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "Square", value: 1 },
  { label: "Tall 3:4", value: 3 / 4 },
];

/** Draws the chosen area of the image onto a canvas and returns it as a JPEG file. */
async function cropToFile(image: HTMLImageElement, crop: PixelCrop, name: string): Promise<File> {
  const canvas = document.createElement("canvas");
  await cropToCanvas(image, canvas, crop);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Could not create the cropped image.");
  return new File([blob], name.replace(/\.[^.]+$/, "") + "-cropped.jpg", { type: "image/jpeg" });
}

/**
 * Pick the part of a photo to keep before it uploads: drag to move, zoom with the slider,
 * choose a shape. "Use whole photo" uploads it uncropped.
 */
export function CropDialog({
  file,
  onDone,
  onCancel,
}: {
  file: File | null;
  onDone: (file: File) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(ASPECTS[0].value);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setCrop(undefined);
    setPixelCrop(null);
    setZoom(1);
    setAspect(ASPECTS[0].value);
    setError(null);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const confirm = async () => {
    if (!file || !src || !pixelCrop || !imageRef.current) return;
    setBusy(true);
    try {
      onDone(await cropToFile(imageRef.current, pixelCrop, file.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not crop this image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={!!file} onClose={onCancel} title="Crop cover photo" size="lg">
      <div className="flex flex-col gap-4">
        <div className="relative h-[min(60vh,420px)] overflow-hidden rounded-md bg-zinc-900">
          {src && (
            <ReactCrop
              crop={crop}
              aspect={aspect}
              onChange={(_crop, percentCrop) => setCrop(percentCrop)}
              onComplete={setPixelCrop}
              style={{ width: "100%", height: "100%" }}
            >
              <img
                ref={imageRef}
                src={src}
                alt="Cover photo"
                onLoad={(event) => {
                  const element = event.currentTarget;
                  const initial = centerCrop(
                    makeAspectCrop({ unit: "%", width: 100 }, aspect, element.naturalWidth, element.naturalHeight),
                    element.naturalWidth,
                    element.naturalHeight,
                  );
                  setCrop(initial);
                }}
                style={{ display: "block", width: "100%", height: "100%" }}
              />
            </ReactCrop>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Shape">
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => setAspect(a.value)}
              aria-pressed={aspect === a.value}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 aria-pressed:border-zinc-900 aria-pressed:bg-zinc-900 aria-pressed:text-white"
            >
              {a.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-zinc-600">
            <ZoomIn className="size-4" aria-hidden />
            <span className="sr-only">Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => {
                const value = Number(e.target.value);
                setZoom(value);
                if (crop) {
                  setCrop({ ...crop, unit: "%", width: Math.min(100, Math.max(15, 100 / value)) });
                }
              }}
              className="w-32 accent-zinc-900"
            />
          </label>
        </div>
        <p className="text-xs text-zinc-500">
          Drag the photo to choose what stays in the frame.{" "}
          {pixelCrop && imageRef.current ? (
            <>
              The cropped photo will be{" "}
              {Math.round(pixelCrop.width * (imageRef.current.naturalWidth / imageRef.current.width))}×{" "}
              {Math.round(pixelCrop.height * (imageRef.current.naturalHeight / imageRef.current.height))} px.
            </>
          ) : null}
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => file && onDone(file)} disabled={busy}>
            Use whole photo
          </Button>
          <Button onClick={() => void confirm()} pending={busy} disabled={!pixelCrop}>
            <CropIcon className="size-4" aria-hidden /> Crop and upload
          </Button>
        </div>
      </div>
    </Modal>
  );
}
