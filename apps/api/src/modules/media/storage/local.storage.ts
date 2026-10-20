import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../../config/env.js';
import type { ImageStorage, StoreInput, StoredImage } from './image-storage.js';

/** URL path the API serves local uploads from (see app.setup.ts). */
export const LOCAL_UPLOADS_PATH = '/api/uploads';

export const uploadRoot = (config: ConfigService<Env, true>) => path.resolve(config.get('UPLOAD_DIR', { infer: true }));

/** Files on the API server's disk under UPLOAD_DIR (a Docker volume in production). */
@Injectable()
export class LocalImageStorage implements ImageStorage {
  readonly provider = 'local' as const;
  private readonly root: string;

  constructor(config: ConfigService<Env, true>) {
    this.root = uploadRoot(config);
  }

  isConfigured(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async store({ buffer, ext, folder }: StoreInput): Promise<StoredImage> {
    const key = `${folder}/${randomUUID()}.${ext}`;
    const file = this.resolve(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buffer, { flag: 'wx' });
    return { key, url: `${LOCAL_UPLOADS_PATH}/${key}`, account: null };
  }

  async remove(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }

  /** Maps a key to a path, refusing anything that would land outside UPLOAD_DIR. */
  private resolve(key: string): string {
    const file = path.resolve(this.root, key);
    const relative = path.relative(this.root, file);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Unsafe storage key: ${key}`);
    }
    return file;
  }
}
