import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import {
  type AdminSettings,
  DEFAULT_FOOTER,
  DEFAULT_HOME_CARDS,
  type EliteBanners,
  eliteBannersSchema,
  type EmailSettings,
  type FooterSettings,
  footerSettingsSchema,
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
  type RealEstateAd,
  realEstateAdSchema,
  type SettingsUpdate,
  type SiteSettings,
  SMTP_SECURITY,
  type WhatsappSettings,
} from '@nsb/shared';
import type { Env } from '../../config/env.js';
import { DB, type Database, type Tx } from '../../db/db.module.js';
import { settings } from '../../db/schema.js';
import { SettingsSecrets } from './settings-secrets.js';
import {
  type CloudinaryCredentials,
  type FirebaseCredentials,
  type SavedStorage,
  savedCloudinarySchema,
  savedFirebaseSchema,
  StorageCredentialsService,
} from './storage-credentials.service.js';

/** SMTP connection and alert recipients, with the password decrypted. */
export interface SmtpConfig extends Omit<EmailSettings, 'active' | 'hasPassword' | 'problem' | 'host' | 'fromEmail'> {
  host: string;
  fromEmail: string;
  password: string;
}

/** Where each setting is stored. A PATCH writes the settings it names; null removes one. */
const KEYS = {
  imageStorage: 'imageStorage',
  cloudinary: 'storage.cloudinary',
  firebase: 'storage.firebase',
  email: 'email.smtp',
  whatsapp: 'contact.whatsapp',
  listingSidebar: 'site.listingSidebar',
  projectSideAd: 'realEstate.projectSideAd',
  realEstateAd: 'realEstate.adBanner',
  pricing: 'site.pricing',
  homeCards: 'home.cards',
  footer: 'home.footer',
  eliteBanners: 'site.eliteBanners',
} as const;

const SETTING_FIELDS = Object.keys(KEYS) as (keyof typeof KEYS)[];

/** Its cards' imageUrl values are uploads, so the media cleanup checks this key too. */
export const HOME_CARDS_KEY = KEYS.homeCards;

/** Its logoUrl is an upload, so the media cleanup checks this key too. */
export const FOOTER_KEY = KEYS.footer;

/** Its imageUrl is an upload, so the media cleanup checks this key before deleting a file. */
export const PROJECT_SIDE_AD_KEY = KEYS.projectSideAd;

/** Its imageUrl and logoUrl are uploads, so the media cleanup checks this key too. */
export const REAL_ESTATE_AD_KEY = KEYS.realEstateAd;

/** Until an admin changes it, the listing page shows both side cards. */
const DEFAULT_LISTING_SIDEBAR: ListingSidebarSettings = { enabled: true, budget: true, type: true };

/** Until Settings › Slot pricing is saved: the real estate plan price; sub-categories use DEFAULT_SLOT_PRICE. */
const DEFAULT_PRICING: Pricing = { categories: {}, realEstate: PROJECT_PLAN_PRICE };

export const PROVIDER_LABELS: Record<ImageStorageProvider, string> = {
  cloudinary: 'Cloudinary',
  firebase: 'Firebase Storage',
  local: 'This server',
};

// Stored rows. Secrets are sealed with SettingsSecrets.
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

interface Saved extends SavedStorage {
  email: SavedEmail | null;
  whatsapp: WhatsappSettings | null;
  listingSidebar: ListingSidebarSettings | null;
  projectSideAd: ProjectSideAd | null;
  realEstateAd: RealEstateAd | null;
  pricing: Pricing | null;
  homeCards: HomeCard[] | null;
  footer: FooterSettings | null;
  eliteBanners: EliteBanners | null;
}

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
  private readonly maxUploadBytes: number;

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly secrets: SettingsSecrets,
    private readonly storage: StorageCredentialsService,
    config: ConfigService<Env, true>,
  ) {
    this.maxUploadBytes = Math.round(config.get('UPLOAD_MAX_MB', { infer: true }) * 1024 * 1024);
  }

  async get(): Promise<AdminSettings> {
    const saved = await this.load();
    return {
      imageStorage: this.storage.active(saved),
      maxUploadBytes: this.maxUploadBytes,
      ...this.storage.describe(saved),
      email: this.describeEmail(saved.email),
      whatsapp: saved.whatsapp,
      listingSidebar: saved.listingSidebar ?? DEFAULT_LISTING_SIDEBAR,
      projectSideAd: saved.projectSideAd,
      realEstateAd: saved.realEstateAd,
      pricing: saved.pricing ?? DEFAULT_PRICING,
      homeCards: saved.homeCards ?? DEFAULT_HOME_CARDS,
      footer: saved.footer ?? DEFAULT_FOOTER,
      eliteBanners: saved.eliteBanners ?? {},
    };
  }

  /** Slot and plan prices, for the dashboard and the listing forms. */
  async pricing(): Promise<Pricing> {
    return (await this.load()).pricing ?? DEFAULT_PRICING;
  }

  /** What the public website needs: the WhatsApp button and the project page ad only while switched on. */
  async siteSettings(): Promise<SiteSettings> {
    const { whatsapp, listingSidebar, projectSideAd, realEstateAd, homeCards, footer, eliteBanners } = await this.load();
    return {
      whatsapp: whatsapp?.enabled ? { number: whatsapp.number, message: whatsapp.message } : null,
      listingSidebar: listingSidebar ?? DEFAULT_LISTING_SIDEBAR,
      projectSideAd: projectSideAd?.enabled ? projectSideAd : null,
      // Sent switched off too: off hides the banner, while null (never saved) shows the demo one.
      realEstateAd,
      homeCards: homeCards ?? DEFAULT_HOME_CARDS,
      footer: footer ?? DEFAULT_FOOTER,
      eliteBanners: eliteBanners ?? {},
    };
  }

  async update(input: SettingsUpdate): Promise<AdminSettings> {
    await this.db.transaction(async (tx) => {
      const saved = await this.load(tx);
      const { cloudinary, firebase, email, ...plain } = input;
      const next: Saved = { ...saved, ...plain };

      if (cloudinary !== undefined) next.cloudinary = this.storage.sealCloudinary(cloudinary, saved.cloudinary);
      if (firebase !== undefined) next.firebase = this.storage.sealFirebase(firebase, saved.firebase);
      if (email !== undefined) {
        next.email = email && {
          ...email,
          // No login: no password. Blank password with a login: keep the saved one.
          password: !email.username
            ? ''
            : email.password
              ? this.secrets.seal(email.password)
              : this.secrets.keepSecret(saved.email?.username ? saved.email.password : undefined, 'Enter the SMTP password'),
        };
      }

      const active = this.storage.active(next);
      if (!this.storage.configured(active, next)) {
        throw new BadRequestException(
          input.imageStorage
            ? `${PROVIDER_LABELS[active]} is not configured. Save its credentials first.`
            : `${PROVIDER_LABELS[active]} stores new uploads. Choose another storage before removing its credentials.`,
        );
      }

      for (const field of SETTING_FIELDS) await this.write(tx, KEYS[field], next[field], input[field] !== undefined);
    });
    return this.get();
  }

  /** Provider for new uploads. Until an admin picks one: Cloudinary when configured, else local. */
  async imageStorage(): Promise<ImageStorageProvider> {
    return this.storage.active(await this.load());
  }

  /** Decrypted credentials for the storage provider, or null when it is not configured. */
  async cloudinaryCredentials(): Promise<CloudinaryCredentials | null> {
    return this.storage.resolveCloudinary((await this.load()).cloudinary).credentials;
  }

  async firebaseCredentials(): Promise<FirebaseCredentials | null> {
    return this.storage.resolveFirebase((await this.load()).firebase).credentials;
  }

  /** SMTP settings for enquiry alerts, or null when none are saved or the password cannot be read. */
  async smtpConfig(): Promise<SmtpConfig | null> {
    const saved = (await this.load()).email;
    if (!saved) return null;
    const password = saved.password ? this.secrets.tryOpen(saved.password) : '';
    if (password === null) {
      this.logger.error('The saved SMTP password cannot be decrypted, so no lead alerts are being sent. Enter it again in Admin > Settings.');
      return null;
    }
    return { ...saved, password };
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
    const unreadable = !!password && this.secrets.tryOpen(password) === null;
    return {
      ...rest,
      active: saved.enabled && !unreadable,
      hasPassword: !!password,
      ...(unreadable && { problem: 'The saved SMTP password cannot be decrypted. Enter it again.' }),
    };
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
      realEstateAd: parse(realEstateAdSchema, value(KEYS.realEstateAd)),
      pricing: parse(pricingSchema, value(KEYS.pricing)),
      homeCards: parse(homeCardsSchema, value(KEYS.homeCards)),
      footer: parse(footerSettingsSchema, value(KEYS.footer)),
      eliteBanners: parse(eliteBannersSchema, value(KEYS.eliteBanners)),
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
