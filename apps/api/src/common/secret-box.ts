import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';

const VERSION = 'v1';

/**
 * Encrypts secrets kept in the database (AES-256-GCM). The key is derived from server
 * configuration, so a database dump alone does not reveal the secrets.
 */
export class SecretBox {
  private readonly key: Buffer;

  constructor(keyMaterial: string) {
    this.key = Buffer.from(hkdfSync('sha256', keyMaterial, 'nsb-settings', 'settings-secrets', 32));
  }

  seal(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return [VERSION, iv, cipher.getAuthTag(), data].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.');
  }

  /** Throws if the value was sealed with another key or has been altered. */
  open(sealed: string): string {
    const [version, iv, tag, data] = sealed.split('.');
    if (version !== VERSION || !iv || !tag || data === undefined) throw new Error('Unrecognised secret format');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(data, 'base64url')), decipher.final()]).toString('utf8');
  }
}
