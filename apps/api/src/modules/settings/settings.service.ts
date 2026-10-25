import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import {
  type AdminSettings,
  DEFAULT_HOME_CARDS,
  type EmailSettings,
  type HomeCard,
  homeCardsSchema,
  IMAGE_STORAGE_PROVIDERS,
  type ImageStorageProvider,
  type ListingSidebarSettings,
  listingSidebarSchema,
  type Pricing,
  pricingSchema,
  PROJECT_PLAN_PRICE,
  type ProjectSideAd,
  projectSideAdSchema,
  type SettingsUpdate,
  type SiteSettings,
  SMTP_SECURITY,
  type StorageProviderStatus,
  type WhatsappSettings,
} from '@nsb/shared';
import { SecretBox } from '../../common/secret-box.js';
import type { Env } from '../../config/env.js';
import { DB, type Database } from '../../db/db.module.js';
import { settings } from '../../db/schema.js';

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

/** SMTP connection and alert recipients, with the password decrypted. */
export interface SmtpConfig extends Omit<EmailSettings, 'active' | 'hasPassword' | 'problem' | 'host' | 'fromEmail'> {
  host: string;
  fromEmail: string;
  password: string;
}

const KEYS = {
  imageStorage: 'imageStorage',
  cloudinary: 'storage.cloudinary',
  firebase: 'storage.firebase',
  email: 'email.smtp',
  whatsapp: 'contact.whatsapp',
  listingSidebar: 'site.listingSidebar',
  projectSideAd: 'realEstate.projectSideAd',
  pricing: 'site.pricing',
  homeCards: 'home.cards',
} as const;

/** Its cards' imageUrl values are uploads, so the media cleanup checks this key too. */
export const HOME_CARDS_KEY = KEYS.homeCards;

/** Its imageUrl is an upload, so the media cleanup checks this key before deleting a file. */
export const PROJECT_SIDE_AD_KEY = KEYS.projectSideAd;

/** Until an admin changes it, the listing page shows both side cards. */
const DEFAULT_LISTING_SIDEBAR: ListingSidebarSettings = { enabled: true, budget: true, type: true };

/** Until Settings › Slot pricing is saved: the real estate plan price; sub-categories use DEFAULT_SLOT_PRICE. */
const DEFAULT_PRICING: Pricing = { categories: {}, realEstate: PROJECT_PLAN_PRICE };

export const PROVIDER_LABELS: Record<ImageStorageProvider, string> = {
  cloudinary: 'Cloudinary',
  firebase: 'Firebase Storage',
  local: 'This server',
};

// Stored rows. Secrets are sealed with SecretBox.
const savedCloudinarySchema = z.object({ cloudName: z.string(), apiKey: z.string(), apiSecret: z.string(), folder: z.string() });
const savedFirebaseSchema = z.object({
  bucket: z.string(),
  projectId: z.string(),
  clientEmail: z.string(),
  privateKey: z.string(),
  folder: z.string(),
});
const savedEmailSchema = z.object({
  enabled: z.boolean(),
  host: z.string(),
  port: z.number(),
  security: z.enum(SMTP_SECURITY),
  username: z.string(),
  /** Sealed; empty when the server needs no login. */
  password: z.string(),
  fromEmail: z.string(),
  fromName: z.string(),
  adminRecipients: z.array(z.string()),
  notifyVendor: z.boolean(),
});
const savedWhatsappSchema = z.object({ enabled: z.boolean(), number: z.string(), message: z.string() });
type SavedEmail = z.infer<typeof savedEmailSchema>;
type SavedCloudinary = z.infer<typeof savedCloudinarySchema>;
type SavedFirebase = z.infer<typeof savedFirebaseSchema>;

interface Saved {
  imageStorage: ImageStorageProvider | null;
  cloudinary: SavedCloudinary | null;
  firebase: SavedFirebase | null;
  email: SavedEmail | null;
  whatsapp: WhatsappSettings | null;
  listingSidebar: ListingSidebarSettings | null;
  projectSideAd: ProjectSideAd | null;
  pricing: Pricing | null;
  homeCards: HomeCard[] | null;
}

interface Resolved<T> {
  credentials: T | null;
  source: StorageProviderStatus['source'];
  problem?: string;
}

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

const parse = <T>(schema: z.ZodType<T>, value: unknown): T | null => {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
};

/**
 * Site settings kept in the database, so admins can change them without a redeploy, including
 * the credentials of each image storage provider. Secrets are encrypted and never returned.
 */
@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly box: SecretBox;
  private readonly maxUploadBytes: number;
  private readonly envCloudinary: CloudinaryCredentials | null;

  constructor(
    @Inject(DB) private readonly db: Database,
    config: ConfigService<Env, true>,
  ) {
    this.box = new SecretBox(config.get('SETTINGS_ENCRYPTION_KEY', { infer: true }) ?? config.get('JWT_SECRET', { infer: true }));
    this.maxUploadBytes = Math.round(config.get('UPLOAD_MAX_MB', { infer: true }) * 1024 * 1024);
    const [cloudName, apiKey, apiSecret] = [
      config.get('CLOUDINARY_CLOUD_NAME', { infer: true }),
      config.get('CLOUDINARY_API_KEY', { infer: true }),
      config.get('CLOUDINARY_API_SECRET', { infer: true }),
    ];
    this.envCloudinary =
      cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret, folder: config.get('CLOUDINARY_FOLDER', { infer: true }) } : null;
  }

  async get(): Promise<AdminSettings> {
    const saved = await this.load();
    const cloudinary = this.resolveCloudinary(saved.cloudinary);
    const firebase = this.resolveFirebase(saved.firebase);
    const status = (r: Resolved<{ folder: string }>, folder: string | undefined) => ({
      configured: !!r.credentials,
      source: r.source,
      ...(r.problem && { problem: r.problem }),
      folder: r.credentials?.folder ?? folder ?? 'nsb',
    });
    return {
      imageStorage: this.active(saved),
      maxUploadBytes: this.maxUploadBytes,
      cloudinary: {
        ...status(cloudinary, saved.cloudinary?.folder),
        cloudName: saved.cloudinary?.cloudName ?? this.envCloudinary?.cloudName ?? null,
        apiKey: saved.cloudinary?.apiKey ?? this.envCloudinary?.apiKey ?? null,
      },
      firebase: {
        ...status(firebase, saved.firebase?.folder),
        bucket: saved.firebase?.bucket ?? null,
        projectId: saved.firebase?.projectId ?? null,
        clientEmail: saved.firebase?.clientEmail ?? null,
      },
      email: this.describeEmail(saved.email),
      whatsapp: saved.whatsapp,
      listingSidebar: saved.listingSidebar ?? DEFAULT_LISTING_SIDEBAR,
      projectSideAd: saved.projectSideAd,
      pricing: saved.pricing ?? DEFAULT_PRICING,
      homeCards: saved.homeCards ?? DEFAULT_HOME_CARDS,
    };
  }

  /** Slot and plan prices, for the dashboard and the listing forms. */
  async pricing(): Promise<Pricing> {
    return (await this.load()).pricing ?? DEFAULT_PRICING;
  }

  /** What the public website needs: the WhatsApp button and the project page ad only while switched on. */
  async siteSettings(): Promise<SiteSettings> {
    const { whatsapp, listingSidebar, projectSideAd, homeCards } = await this.load();
    return {
      whatsapp: whatsapp?.enabled ? { number: whatsapp.number, message: whatsapp.message } : null,
      listingSidebar: listingSidebar ?? DEFAULT_LISTING_SIDEBAR,
      projectSideAd: projectSideAd?.enabled ? projectSideAd : null,
      homeCards: homeCards ?? DEFAULT_HOME_CARDS,
    };
  }

  async update(input: SettingsUpdate): Promise<AdminSettings> {
    await this.db.transaction(async (tx) => {
      const saved = await this.load(tx);
      const next: Saved = { ...saved };

      if (input.cloudinary !== undefined) {
        const c = input.cloudinary;
        next.cloudinary = c && {
          cloudName: c.cloudName,
          apiKey: c.apiKey,
          folder: c.folder,
          apiSecret: c.apiSecret ? this.box.seal(c.apiSecret) : this.keepSecret(saved.cloudinary?.apiSecret, 'Enter the Cloudinary API secret'),
        };
      }
      if (input.firebase !== undefined) {
        const f = input.firebase;
        const account = f?.serviceAccount;
        next.firebase = f && {
          bucket: f.bucket,
          folder: f.folder,
          projectId: account?.project_id ?? saved.firebase?.projectId ?? '',
          clientEmail: account?.client_email ?? saved.firebase?.clientEmail ?? '',
          privateKey: account
            ? this.box.seal(account.private_key)
            : this.keepSecret(saved.firebase?.privateKey, 'Upload the Firebase service account key file'),
        };
      }
      if (input.email !== undefined) {
        const e = input.email;
        next.email = e && {
          ...e,
          // No login: no password. Blank password with a login: keep the saved one.
          password: !e.username
            ? ''
            : e.password
              ? this.box.seal(e.password)
              : this.keepSecret(saved.email?.username ? saved.email.password : undefined, 'Enter the SMTP password'),
        };
      }
      if (input.whatsapp !== undefined) next.whatsapp = input.whatsapp;
      if (input.listingSidebar) next.listingSidebar = input.listingSidebar;
      if (input.projectSideAd !== undefined) next.projectSideAd = input.projectSideAd;
      if (input.pricing) next.pricing = input.pricing;
      if (input.homeCards) next.homeCards = input.homeCards;
      if (input.imageStorage) next.imageStorage = input.imageStorage;

      const active = this.active(next);
      if (!this.configured(active, next)) {
        throw new BadRequestException(
          input.imageStorage
            ? `${PROVIDER_LABELS[active]} is not configured. Save its credentials first.`
            : `${PROVIDER_LABELS[active]} stores new uploads. Choose another storage before removing its credentials.`,
        );
      }

      await this.write(tx, KEYS.cloudinary, next.cloudinary, input.cloudinary !== undefined);
      await this.write(tx, KEYS.firebase, next.firebase, input.firebase !== undefined);
      await this.write(tx, KEYS.imageStorage, next.imageStorage, !!input.imageStorage);
      await this.write(tx, KEYS.email, next.email, input.email !== undefined);
      await this.write(tx, KEYS.whatsapp, next.whatsapp, input.whatsapp !== undefined);
      await this.write(tx, KEYS.listingSidebar, next.listingSidebar, !!input.listingSidebar);
      await this.write(tx, KEYS.projectSideAd, next.projectSideAd, input.projectSideAd !== undefined);
      await this.write(tx, KEYS.pricing, next.pricing, !!input.pricing);
      await this.write(tx, KEYS.homeCards, next.homeCards, !!input.homeCards);
    });
    return this.get();
  }

  /** Provider for new uploads. Until an admin picks one: Cloudinary when configured, else local. */
  async imageStorage(): Promise<ImageStorageProvider> {
    return this.active(await this.load());
  }

  /** Decrypted credentials for the storage provider, or null when it is not configured. */
  async cloudinaryCredentials(): Promise<CloudinaryCredentials | null> {
    return this.resolveCloudinary((await this.load()).cloudinary).credentials;
  }

  async firebaseCredentials(): Promise<FirebaseCredentials | null> {
    return this.resolveFirebase((await this.load()).firebase).credentials;
  }

  /** SMTP settings for enquiry alerts, or null when none are saved or the password cannot be read. */
  async smtpConfig(): Promise<SmtpConfig | null> {
    const saved = (await this.load()).email;
    if (!saved) return null;
    const password = saved.password ? this.tryOpen(saved.password) : '';
    return password === null ? null : { ...saved, password };
  }

  private describeEmail(saved: SavedEmail | null): EmailSettings {
    if (!saved) {
      return {
        active: false,
        enabled: false,
        host: null,
        port: 465,
        security: 'tls',
        username: '',
        hasPassword: false,
        fromEmail: null,
        fromName: 'Noida Super Bazaar',
        adminRecipients: [],
        notifyVendor: true,
      };
    }
    const { password, ...rest } = saved;
    const unreadable = !!password && this.tryOpen(password) === null;
    return {
      ...rest,
      active: saved.enabled && !unreadable,
      hasPassword: !!password,
      ...(unreadable && { problem: 'The saved SMTP password cannot be decrypted. Enter it again.' }),
    };
  }

  private active(saved: Saved): ImageStorageProvider {
    return saved.imageStorage ?? (this.resolveCloudinary(saved.cloudinary).credentials ? 'cloudinary' : 'local');
  }

  private configured(provider: ImageStorageProvider, saved: Saved): boolean {
    if (provider === 'cloudinary') return !!this.resolveCloudinary(saved.cloudinary).credentials;
    if (provider === 'firebase') return !!this.resolveFirebase(saved.firebase).credentials;
    return true;
  }

  /** Saved credentials win over the CLOUDINARY_* environment variables. */
  private resolveCloudinary(saved: SavedCloudinary | null): Resolved<CloudinaryCredentials> {
    if (!saved) return { credentials: this.envCloudinary, source: this.envCloudinary ? 'env' : null };
    const apiSecret = this.tryOpen(saved.apiSecret);
    if (apiSecret === null) return { credentials: null, source: 'admin', problem: 'The saved API secret cannot be decrypted. Enter it again.' };
    return { credentials: { ...saved, apiSecret }, source: 'admin' };
  }

  private resolveFirebase(saved: SavedFirebase | null): Resolved<FirebaseCredentials> {
    if (!saved) return { credentials: null, source: null };
    const privateKey = this.tryOpen(saved.privateKey);
    if (privateKey === null) {
      return { credentials: null, source: 'admin', problem: 'The saved key file cannot be decrypted. Upload it again.' };
    }
    return { credentials: { ...saved, privateKey }, source: 'admin' };
  }

  /** Null when the secret was sealed with another key (SETTINGS_ENCRYPTION_KEY or JWT_SECRET changed). */
  private tryOpen(sealed: string): string | null {
    try {
      return this.box.open(sealed);
    } catch {
      this.logger.warn('A saved storage secret could not be decrypted; it must be entered again');
      return null;
    }
  }

  /** Keeps a saved secret when the form leaves it blank, as long as it can still be used. */
  private keepSecret(sealed: string | undefined, message: string): string {
    if (!sealed || this.tryOpen(sealed) === null) throw new BadRequestException(message);
    return sealed;
  }

  private async load(db: Database | Tx = this.db): Promise<Saved> {
    const rows = await db
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(inArray(settings.key, Object.values(KEYS)));
    const value = (key: string) => rows.find((r) => r.key === key)?.value;
    return {
      imageStorage: parse(z.enum(IMAGE_STORAGE_PROVIDERS), value(KEYS.imageStorage)),
      cloudinary: parse(savedCloudinarySchema, value(KEYS.cloudinary)),
      firebase: parse(savedFirebaseSchema, value(KEYS.firebase)),
      email: parse(savedEmailSchema, value(KEYS.email)),
      whatsapp: parse(savedWhatsappSchema, value(KEYS.whatsapp)),
      listingSidebar: parse(listingSidebarSchema, value(KEYS.listingSidebar)),
      projectSideAd: parse(projectSideAdSchema, value(KEYS.projectSideAd)),
      pricing: parse(pricingSchema, value(KEYS.pricing)),
      homeCards: parse(homeCardsSchema, value(KEYS.homeCards)),
    };
  }

  private async write(tx: Tx, key: string, value: unknown, changed: boolean) {
    if (!changed) return;
    if (value === null) {
      await tx.delete(settings).where(eq(settings.key, key));
      return;
    }
    await tx
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  }
}
