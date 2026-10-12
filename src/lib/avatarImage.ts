export const MAX_AVATAR_BYTES = 3 * 1024 * 1024;

export const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const AVATAR_ACCEPT = ACCEPTED_AVATAR_TYPES.join(',');

export const AVATAR_OUTPUT_SIZE = 512;

export const MIN_AVATAR_SOURCE_SIZE = 64;

const OUTPUT_QUALITY = 0.9;

export const megabytes = (bytes: number): string => {
  const mb = Math.round((bytes / (1024 * 1024)) * 10) / 10;

  return `${mb}MB`;
};

export const isAcceptedAvatarType = (type: string): boolean =>
  (ACCEPTED_AVATAR_TYPES as readonly string[]).includes(type);

export interface LoadedImage {
  image: HTMLImageElement;
  url: string;
}

export const loadImageFile = (file: File): Promise<LoadedImage> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (
        image.naturalWidth < MIN_AVATAR_SOURCE_SIZE ||
        image.naturalHeight < MIN_AVATAR_SOURCE_SIZE
      ) {
        URL.revokeObjectURL(url);
        reject(new Error('too-small'));
        return;
      }
      resolve({ image, url });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };

    image.src = url;
  });

let webpEncoding: boolean | null = null;

const canEncodeWebp = (): boolean => {
  if (webpEncoding !== null) {
    return webpEncoding;
  }

  try {
    const probe = document.createElement('canvas');
    probe.width = 1;
    probe.height = 1;
    webpEncoding = probe.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    webpEncoding = false;
  }

  return webpEncoding;
};

export interface SquareCrop {
  x: number;
  y: number;
  size: number;
}

export interface CroppedAvatar {
  blob: Blob;
  filename: string;
}

export const cropToSquare = async (
  image: HTMLImageElement,
  crop: SquareCrop
): Promise<CroppedAvatar> => {
  const type = canEncodeWebp() ? 'image/webp' : 'image/jpeg';
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('no-canvas');
  }

  if (type === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const side = Math.max(1, Math.min(crop.size, image.naturalWidth, image.naturalHeight));
  const x = Math.max(0, Math.min(crop.x, image.naturalWidth - side));
  const y = Math.max(0, Math.min(crop.y, image.naturalHeight - side));

  ctx.drawImage(image, x, y, side, side, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, OUTPUT_QUALITY)
  );

  if (!blob) {
    throw new Error('no-blob');
  }

  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';

  return { blob, filename: `avatar.${ext}` };
};
