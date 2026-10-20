import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { type CloudinaryCredentials, SettingsService } from '../../settings/settings.service.js';
import { AccountChangedError, type ImageStorage, type StoreInput, type StoredImage } from './image-storage.js';

const TIMEOUT_MS = 30_000;

/**
 * Cloudinary through its signed REST upload API, so no SDK is needed. Credentials come from
 * Settings (or the CLOUDINARY_* variables) and stay on the server.
 */
@Injectable()
export class CloudinaryImageStorage implements ImageStorage {
  readonly provider = 'cloudinary' as const;

  constructor(private readonly settings: SettingsService) {}

  async isConfigured(): Promise<boolean> {
    return !!(await this.settings.cloudinaryCredentials());
  }

  async store({ buffer, mimeType, folder }: StoreInput): Promise<StoredImage> {
    const creds = await this.credentials();
    const body = this.signedForm(creds, { folder: `${creds.folder}/${folder}` });
    body.append('file', new Blob([new Uint8Array(buffer)], { type: mimeType }));
    const result = await this.call<{ secure_url: string; public_id: string }>(creds, 'upload', body);
    return { url: result.secure_url, key: result.public_id, account: creds.cloudName };
  }

  async remove(key: string, account: string | null): Promise<void> {
    const creds = await this.credentials();
    if (creds.cloudName !== account) throw new AccountChangedError('Cloudinary', account, creds.cloudName);
    // invalidate also clears CDN-cached copies; "not found" counts as removed.
    const result = await this.call<{ result: string }>(creds, 'destroy', this.signedForm(creds, { public_id: key, invalidate: 'true' }));
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary destroy returned "${result.result}"`);
    }
  }

  private async credentials(): Promise<CloudinaryCredentials> {
    const creds = await this.settings.cloudinaryCredentials();
    if (!creds) throw new Error('Cloudinary is not configured');
    return creds;
  }

  /** Form fields plus api_key and a SHA-1 signature over the sorted parameters. */
  private signedForm(creds: CloudinaryCredentials, params: Record<string, string>): FormData {
    const all: Record<string, string> = { ...params, timestamp: String(Math.floor(Date.now() / 1000)) };
    const toSign = Object.keys(all)
      .sort()
      .map((k) => `${k}=${all[k]}`)
      .join('&');
    const form = new FormData();
    for (const [k, v] of Object.entries(all)) form.append(k, v);
    form.append('api_key', creds.apiKey);
    form.append('signature', createHash('sha1').update(toSign + creds.apiSecret).digest('hex'));
    return form;
  }

  private async call<T>(creds: CloudinaryCredentials, action: 'upload' | 'destroy', body: FormData): Promise<T> {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(creds.cloudName)}/image/${action}`, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
    if (!res.ok) throw new Error(`Cloudinary ${action} failed (${res.status}): ${json.error?.message ?? 'no details'}`);
    return json;
  }
}
