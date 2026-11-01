import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { and, asc, eq, inArray, lt, type SQL, sql } from 'drizzle-orm';
import {
  IMAGE_MAX_SIDE,
  IMAGE_SLOTS,
  imageTooSmall,
  type ImageSlotKey,
  type ImageStorageProvider,
  type StorageTestResult,
  type UploadedImage,
} from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { banners, categories, listingImages, listings, media, projects, settings } from '../../db/schema.js';
import { PROVIDER_LABELS, SettingsService } from '../settings/settings.service.js';
import { readImageInfo } from './image-info.js';
import type { ImageStorage } from './storage/image-storage.js';
import { CloudinaryImageStorage } from './storage/cloudinary.storage.js';
import { FirebaseImageStorage } from './storage/firebase.storage.js';
import { LocalImageStorage } from './storage/local.storage.js';

/** The parts of a multer file this service reads (memory storage). */
export interface UploadedFile {
  buffer: Buffer;
  size: number;
}

/**
 * True while any record still points at the media row's URL. Every column that stores an
 * image URL must be listed here, or its files could be deleted while still in use.
 */
const inUse = sql`(
  exists (select 1 from ${banners} where ${banners.imageUrl} = ${media.url} or ${banners.mobileImageUrl} = ${media.url})
  or exists (select 1 from ${categories} where ${categories.imageUrl} = ${media.url})
  or exists (select 1 from ${listings} where ${listings.coverImageUrl} = ${media.url})
  or exists (select 1 from ${listingImages} where ${listingImages.url} = ${media.url})
  or exists (select 1 from ${projects} where ${media.url} = any(${projects.photos}))
  or exists (
    select 1 from ${projects}, jsonb_array_elements(${projects.configurations}) as plan(c)
    where plan.c->>'plan2dUrl' = ${media.url} or plan.c->>'plan3dUrl' = ${media.url}
  )
  or exists (select 1 from ${settings} where position(${media.url} in ${settings.value}::text) > 0)
)`;

/** A file no record uses is kept this long: an admin may upload one and save the form days later. */
const UNUSED_DAYS = 7;
const SWEEP_MS = 86_400_000;
/** Files one sweep removes; any more go in the next one. */
const SWEEP_LIMIT = 500;

/** 1×1 transparent PNG for connection tests. */
const TEST_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

@Injectable()
export class MediaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaService.name);
  private readonly storages: Record<ImageStorageProvider, ImageStorage>;
  private sweeps?: NodeJS.Timeout;

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly settings: SettingsService,
    local: LocalImageStorage,
    cloudinary: CloudinaryImageStorage,
    firebase: FirebaseImageStorage,
  ) {
    this.storages = { local, cloudinary, firebase };
  }

  onModuleInit() {
    this.sweeps = setInterval(() => void this.sweep(), SWEEP_MS);
    this.sweeps.unref();
  }

  onModuleDestroy() {
    clearInterval(this.sweeps);
  }

  /** Validates the image, stores it with the provider chosen in Settings and records where it went. */
  async upload(file: UploadedFile | undefined, slotKey: ImageSlotKey): Promise<UploadedImage> {
    if (!file?.buffer.length) throw new BadRequestException('Choose an image to upload');
    const info = readImageInfo(file.buffer);
    if (!info) throw new BadRequestException('Upload a JPEG, PNG or WebP image');

    const slot = IMAGE_SLOTS[slotKey];
    const { width, height } = info;
    const tooSmall = imageTooSmall(slotKey, width, height);
    if (tooSmall) throw new BadRequestException(tooSmall);
    if (width > IMAGE_MAX_SIDE || height > IMAGE_MAX_SIDE) {
      throw new BadRequestException(`Images can be at most ${IMAGE_MAX_SIDE} px on each side.`);
    }

    const provider = await this.settings.imageStorage();
    const storage = this.storages[provider];
    if (!(await storage.isConfigured())) {
      throw new ServiceUnavailableException(`${PROVIDER_LABELS[provider]} is not configured. Check its credentials in Settings.`);
    }

    let stored;
    try {
      stored = await storage.store({ buffer: file.buffer, ext: info.ext, mimeType: info.mimeType, folder: slot.folder });
    } catch (err) {
      this.logger.error(`Upload to ${provider} failed`, err);
      throw new BadGatewayException('The image could not be saved. Please try again.');
    }

    try {
      await this.db.insert(media).values({
        url: stored.url,
        provider,
        storageKey: stored.key,
        account: stored.account,
        mimeType: info.mimeType,
        bytes: file.size,
        width,
        height,
      });
    } catch (err) {
      // Untracked files could never be cleaned up, so roll the upload back.
      await this.removeFile(provider, stored.key, stored.account);
      throw err;
    }
    return { url: stored.url, width, height, provider };
  }

  /**
   * Deletes uploaded files that no record uses any more, from whichever provider holds each
   * one. Call it after the change that dropped the URLs has been saved, with the URLs the
   * record still has as `kept`, so an unchanged image costs nothing. It never throws: a
   * failed cleanup is logged and must not fail the request that triggered it.
   */
  async release(urls: Array<string | null | undefined>, kept: Array<string | null | undefined> = []): Promise<void> {
    const candidates = [...new Set(urls.filter((u): u is string => !!u && !kept.includes(u)))];
    if (candidates.length) await this.removeUnused(inArray(media.url, candidates));
  }

  /** Removes uploads from forms that were never saved. It never throws, like `release`. */
  async sweep(): Promise<void> {
    await this.removeUnused(lt(media.createdAt, sql`now() - make_interval(days => ${UNUSED_DAYS})`));
  }

  private async removeUnused(which: SQL) {
    try {
      const unused = await this.db
        .select({ id: media.id })
        .from(media)
        .where(and(which, sql`not ${inUse}`))
        .orderBy(asc(media.createdAt))
        .limit(SWEEP_LIMIT);
      for (const { id } of unused) {
        await this.db.transaction(async (tx) => {
          // Locked and checked again, so two cleanups never act on one file, and one picked up since stays.
          const [file] = await tx
            .select({ provider: media.provider, storageKey: media.storageKey, account: media.account })
            .from(media)
            .where(and(eq(media.id, id), sql`not ${inUse}`))
            .for('update', { of: media, skipLocked: true });
          // File first: if that fails, the row stays and the file can still be found later.
          if (file && (await this.removeFile(file.provider, file.storageKey, file.account))) {
            await tx.delete(media).where(eq(media.id, id));
          }
        });
      }
    } catch (err) {
      this.logger.error('Image cleanup failed', err);
    }
  }

  /**
   * Stores and deletes a 1×1 image with the provider's current credentials. The provider's own
   * error is shown to the admin (it names the problem, e.g. a wrong API key, never a secret).
   */
  async testStorage(provider: ImageStorageProvider): Promise<StorageTestResult> {
    const storage = this.storages[provider];
    const label = PROVIDER_LABELS[provider];
    if (!(await storage.isConfigured())) return { ok: false, message: `${label} is not configured.` };
    try {
      const stored = await storage.store({ buffer: TEST_PNG, ext: 'png', mimeType: 'image/png', folder: 'connection-test' });
      await storage.remove(stored.key, stored.account);
      return { ok: true, message: `${label} works: a test image was uploaded and deleted.` };
    } catch (err) {
      this.logger.warn(`${label} connection test failed`, err);
      // Local errors can include server paths, so only cloud providers' messages are passed on.
      const detail = provider === 'local' ? 'Check that UPLOAD_DIR exists and is writable.' : (err as Error).message;
      return { ok: false, message: `${label} test failed. ${detail}` };
    }
  }

  private async removeFile(provider: ImageStorageProvider, key: string, account: string | null): Promise<boolean> {
    try {
      await this.storages[provider].remove(key, account);
      return true;
    } catch (err) {
      this.logger.error(`Could not delete ${provider} image ${key}`, err);
      return false;
    }
  }
}
