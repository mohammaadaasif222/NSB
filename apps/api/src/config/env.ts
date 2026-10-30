import { DEFAULT_UPLOAD_MAX_MB } from '@nsb/shared';
import { z } from 'zod';

/** Unset and empty both mean "not configured" (compose passes empty strings through). */
const optionalSecret = z.preprocess((v) => (v === '' ? undefined : v), z.string().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  /**
   * Encrypts storage credentials saved in Admin > Settings. Falls back to JWT_SECRET; changing
   * whichever is used means re-entering those credentials.
   */
  SETTINGS_ENCRYPTION_KEY: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().min(32, 'SETTINGS_ENCRYPTION_KEY must be at least 32 characters').optional(),
  ),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).default(7),
  /** Set to false only for local http development. */
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  /** Public address of the site, e.g. https://noidasuperbazaar.com. Used for links in emails. */
  SITE_URL: z.preprocess((v) => (v === '' ? undefined : v), z.url().optional()),
  /** The admin panel's address for email links, when it is not on SITE_URL. */
  ADMIN_URL: z.preprocess((v) => (v === '' ? undefined : v), z.url().optional()),
  /** Local image storage: files are written here and served at /api/uploads/. */
  UPLOAD_DIR: z.string().min(1).default('uploads'),
  UPLOAD_MAX_MB: z.coerce.number().positive().max(50).default(DEFAULT_UPLOAD_MAX_MB),
  /** Fallback Cloudinary credentials, used when none are saved in Admin > Settings. */
  CLOUDINARY_CLOUD_NAME: optionalSecret,
  CLOUDINARY_API_KEY: optionalSecret,
  CLOUDINARY_API_SECRET: optionalSecret,
  CLOUDINARY_FOLDER: z.string().min(1).default('nsb'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment variables:\n${details}`);
  }
  return result.data;
}

/** Loads apps/api/.env into process.env for standalone scripts (migrate, seed). */
export function loadEnvFile(path = '.env'): void {
  try {
    process.loadEnvFile(path);
  } catch {
    // No .env file (e.g. in Docker) — rely on the real environment.
  }
}
