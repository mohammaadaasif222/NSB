import { createHash, createSign, randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { type FirebaseCredentials, SettingsService } from '../../settings/settings.service.js';
import { AccountChangedError, type ImageStorage, type StoreInput, type StoredImage } from './image-storage.js';

const TIMEOUT_MS = 30_000;
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/devstorage.read_write';
const STORAGE_API = 'https://storage.googleapis.com/storage/v1';
const UPLOAD_API = 'https://storage.googleapis.com/upload/storage/v1';
/** Renew access tokens this long before Google's expiry. */
const TOKEN_MARGIN_MS = 60_000;

const b64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

/**
 * Firebase Storage (a Google Cloud Storage bucket) through Google's REST APIs, authenticated
 * with the service account saved in Settings, so no SDK is needed. Files get a Firebase
 * download token, giving the same public URL the Firebase console shows.
 */
@Injectable()
export class FirebaseImageStorage implements ImageStorage {
  readonly provider = 'firebase' as const;
  private token: { id: string; value: string; expiresAt: number } | null = null;

  constructor(private readonly settings: SettingsService) {}

  async isConfigured(): Promise<boolean> {
    return !!(await this.settings.firebaseCredentials());
  }

  async store({ buffer, ext, mimeType, folder }: StoreInput): Promise<StoredImage> {
    const creds = await this.credentials();
    const name = `${creds.folder}/${folder}/${randomUUID()}.${ext}`;
    const downloadToken = randomUUID();
    const metadata = {
      name,
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000, immutable',
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    };
    const boundary = `nsb-${randomUUID()}`;
    const body = Buffer.concat([
      Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
      Buffer.from(`--${boundary}\r\ncontent-type: ${mimeType}\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);
    await this.request(creds, `${UPLOAD_API}/b/${encodeURIComponent(creds.bucket)}/o?uploadType=multipart`, {
      method: 'POST',
      headers: { 'content-type': `multipart/related; boundary=${boundary}` },
      body: new Uint8Array(body),
    });
    return {
      key: name,
      account: creds.bucket,
      url: `https://firebasestorage.googleapis.com/v0/b/${creds.bucket}/o/${encodeURIComponent(name)}?alt=media&token=${downloadToken}`,
    };
  }

  async remove(key: string, account: string | null): Promise<void> {
    const creds = await this.credentials();
    if (creds.bucket !== account) throw new AccountChangedError('Firebase', account, creds.bucket);
    await this.request(creds, `${STORAGE_API}/b/${encodeURIComponent(creds.bucket)}/o/${encodeURIComponent(key)}`, { method: 'DELETE' }, [404]);
  }

  private async credentials(): Promise<FirebaseCredentials> {
    const creds = await this.settings.firebaseCredentials();
    if (!creds) throw new Error('Firebase Storage is not configured');
    return creds;
  }

  /** Calls a Cloud Storage endpoint; `okStatuses` are also accepted (404 when deleting). */
  private async request(creds: FirebaseCredentials, url: string, init: RequestInit, okStatuses: number[] = []): Promise<void> {
    const res = await fetch(url, {
      ...init,
      headers: { ...init.headers, authorization: `Bearer ${await this.accessToken(creds)}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok || okStatuses.includes(res.status)) return;
    const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(`Firebase Storage request failed (${res.status}): ${json.error?.message ?? 'no details'}`);
  }

  /** OAuth access token from a self-signed service-account JWT, cached until shortly before it expires. */
  private async accessToken(creds: FirebaseCredentials): Promise<string> {
    const id = createHash('sha256').update(`${creds.clientEmail}\n${creds.privateKey}`).digest('hex');
    if (this.token?.id === id && this.token.expiresAt > Date.now() + TOKEN_MARGIN_MS) return this.token.value;

    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(
      JSON.stringify({ iss: creds.clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
    )}`;
    const signature = createSign('RSA-SHA256').update(unsigned).sign(creds.privateKey, 'base64url');
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string };
    if (!res.ok || !json.access_token) {
      throw new Error(`Google sign-in failed (${res.status}): ${json.error_description ?? 'no details'}`);
    }
    this.token = { id, value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000 };
    return json.access_token;
  }
}
