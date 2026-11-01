import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretBox } from '../../common/secret-box.js';
import type { Env } from '../../config/env.js';

/** Seals the secrets saved in settings and opens them again. */
@Injectable()
export class SettingsSecrets {
  private readonly logger = new Logger(SettingsSecrets.name);
  private readonly box: SecretBox;

  constructor(config: ConfigService<Env, true>) {
    this.box = new SecretBox(config.get('SETTINGS_ENCRYPTION_KEY', { infer: true }) ?? config.get('JWT_SECRET', { infer: true }));
  }

  seal(secret: string): string {
    return this.box.seal(secret);
  }

  /** Null when the secret was sealed with another key (SETTINGS_ENCRYPTION_KEY or JWT_SECRET changed). */
  tryOpen(sealed: string): string | null {
    try {
      return this.box.open(sealed);
    } catch {
      this.logger.warn('A saved storage secret could not be decrypted; it must be entered again');
      return null;
    }
  }

  /** Keeps a saved secret when the form leaves it blank, as long as it can still be used. */
  keepSecret(sealed: string | undefined, message: string): string {
    if (!sealed || this.tryOpen(sealed) === null) throw new BadRequestException(message);
    return sealed;
  }
}
