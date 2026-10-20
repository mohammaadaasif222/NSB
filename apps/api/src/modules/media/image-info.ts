import type { ImageMimeType } from '@nsb/shared';

export interface ImageInfo {
  mimeType: ImageMimeType;
  ext: 'jpg' | 'png' | 'webp';
  width: number;
  height: number;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** JPEG start-of-frame markers, which carry the image size (not DHT 0xC4, JPG 0xC8 or DAC 0xCC). */
const isStartOfFrame = (m: number) => m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc;

function png(buf: Buffer): ImageInfo | null {
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  if (buf.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { mimeType: 'image/png', ext: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpeg(buf: Buffer): ImageInfo | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 3 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    if (marker === 0xff) {
      i += 1; // fill byte
      continue;
    }
    // Markers without a length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      i += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null; // end of image / start of scan before a frame
    if (isStartOfFrame(marker)) {
      if (i + 9 > buf.length) return null;
      return { mimeType: 'image/jpeg', ext: 'jpg', height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function webp(buf: Buffer): ImageInfo | null {
  if (buf.length < 30 || buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') {
    return null;
  }
  const info = (width: number, height: number): ImageInfo => ({ mimeType: 'image/webp', ext: 'webp', width, height });
  switch (buf.toString('latin1', 12, 16)) {
    case 'VP8 ': // lossy
      return info(buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff);
    case 'VP8L': {
      // lossless: 14-bit width-1 and height-1 packed after the 0x2f signature byte
      if (buf[20] !== 0x2f) return null;
      const bits = buf.readUInt32LE(21);
      return info((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1);
    }
    case 'VP8X': // extended: 24-bit canvas width-1 and height-1
      return info(buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1);
    default:
      return null;
  }
}

/**
 * Identifies a JPEG, PNG or WebP image from its bytes and reads its pixel size from the header.
 * Returns null for anything else, whatever the file name or claimed content type says.
 */
export function readImageInfo(buf: Buffer): ImageInfo | null {
  const result = png(buf) ?? jpeg(buf) ?? webp(buf);
  return result && result.width > 0 && result.height > 0 ? result : null;
}
