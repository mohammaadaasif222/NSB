import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import type { AdminSettings, ImageStorageProvider, SettingsUpdate, StorageProviderStatus } from '@nsb/shared';
import type { Env } from '../../config/env.js';
import { SettingsSecrets } from './settings-secrets.js';

export interface CloudinaryCredentials {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

export interface FirebaseCredentials {
  bucket: string;
  projectId: string;
  clientEmail: string;
  privateKey: string;
  folder: string;
}

// Stored rows. Secrets are sealed.
export const savedCloudinarySchema = z.object({ cloudName: z.string(), apiKey: z.string(), apiSecret: z.string(), folder: z.string() });
export const savedFirebaseSchema = z.object({
  bucket: z.string(),
  projectId: z.string(),
  clientEmail: z.string(),
  privateKey: z.string(),
  folder: z.string(),
});
type SavedCloudinary = z.infer<typeof savedCloudinarySchema>;
type SavedFirebase = z.infer<typeof savedFirebaseSchema>;

/** The saved settings this service works from. */
export interface SavedStorage {
  imageStorage: ImageStorageProvider | null;
  cloudinary: SavedCloudinary | null;
  firebase: SavedFirebase | null;
}

interface Resolved<T> {
  credentials: T | null;
  source: StorageProviderStatus['source'];
  problem?: string;
}

const status = (r: Resolved<{ folder: string }>, folder: string | undefined) => ({
  configured: !!r.credentials,
  source: r.source,
  ...(r.problem && { problem: r.problem }),
  folder: r.credentials?.folder ?? folder ?? 'nsb',
});

/** The image storage providers' credentials: saved encrypted, with an environment fallback for Cloudinary. */
@Injectable()
export class StorageCredentialsService {
  private readonly envCloudinary: CloudinaryCredentials | null;

  constructor(
    private readonly secrets: SettingsSecrets,
    config: ConfigService<Env, true>,
  ) {
    const [cloudName, apiKey, apiSecret] = [
      config.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
      config.get('CLOUDINARY_API_KEY', { infer: true }),
      config.get('CLOUDINARY_API_SECRET', { infer: true }),
    ];
    this.envCloudinary =
      cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret, folder: config.get('CLOUDINARY_FOLDER', { infer: true }) } : null;
  }

  /** What Admin › Settings shows about each provider. Secrets are never included. */
  describe(saved: SavedStorage): Pick<AdminSettings, 'cloudinary' | 'firebase'> {
    return {
      cloudinary: {
        ...status(this.resolveCloudinary(saved.cloudinary), saved.cloudinary?.folder),
        cloudName: saved.cloudinary?.cloudName ?? this.envCloudinary?.cloudName ?? null,
        apiKey: saved.cloudinary?.apiKey ?? this.envCloudinary?.apiKey ?? null,
      },
      firebase: {
        ...status(this.resolveFirebase(saved.firebase), saved.firebase?.folder),
        bucket: saved.firebase?.bucket ?? null,
        projectId: saved.firebase?.projectId ?? null,
        clientEmail: saved.firebase?.clientEmail ?? null,
      },
    };
  }

  /** The row to save for a Cloudinary form. A blank secret keeps the saved one. */
  sealCloudinary(c: NonNullable<SettingsUpdate['cloudinary']> | null, saved: SavedCloudinary | null): SavedCloudinary | null {
    return (
      c && {
        cloudName: c.cloudName,
        apiKey: c.apiKey,
        folder: c.folder,
        apiSecret: c.apiSecret ? this.secrets.seal(c.apiSecret) : this.secrets.keepSecret(saved?.apiSecret, 'Enter the Cloudinary API secret'),
      }
    );
  }

  /** The row to save for a Firebase form. Without a new key file, the saved account stays. */
  sealFirebase(f: NonNullable<SettingsUpdate['firebase']> | null, saved: SavedFirebase | null): SavedFirebase | null {
    const account = f?.serviceAccount;
    return (
      f && {
        bucket: f.bucket,
        folder: f.folder,
        projectId: account?.project_id ?? saved?.projectId ?? '',
        clientEmail: account?.client_email ?? saved?.clientEmail ?? '',
        privateKey: account
          ? this.secrets.seal(account.private_key)
          : this.secrets.keepSecret(saved?.privateKey, 'Upload the Firebase service account key file'),
      }
    );
  }

  /** Provider for new uploads. Until an admin picks one: Cloudinary when configured, else local. */
  active(saved: SavedStorage): ImageStorageProvider {
    return saved.imageStorage ?? (this.resolveCloudinary(saved.cloudinary).credentials ? 'cloudinary' : 'local');
  }

  configured(provider: ImageStorageProvider, saved: SavedStorage): boolean {
    if (provider === 'cloudinary') return !!this.resolveCloudinary(saved.cloudinary).credentials;
    if (provider === 'firebase') return !!this.resolveFirebase(saved.firebase).credentials;
    return true;
  }

  /** Saved credentials win over the CLOUDINARY_* environment variables. */
  resolveCloudinary(saved: SavedCloudinary | null): Resolved<CloudinaryCredentials> {
    if (!saved) return { credentials: this.envCloudinary, source: this.envCloudinary ? 'env' : null };
    const apiSecret = this.secrets.tryOpen(saved.apiSecret);
    if (apiSecret === null) return { credentials: null, source: 'admin', problem: 'The saved API secret cannot be decrypted. Enter it again.' };
    return { credentials: { ...saved, apiSecret }, source: 'admin' };
  }

  resolveFirebase(saved: SavedFirebase | null): Resolved<FirebaseCredentials> {
    if (!saved) return { credentials: null, source: null };
    const privateKey = this.secrets.tryOpen(saved.privateKey);
    if (privateKey === null) {
      return { credentials: null, source: 'admin', problem: 'The saved key file cannot be decrypted. Upload it again.' };
    }
    return { credentials: { ...saved, privateKey }, source: 'admin' };
  }
}
