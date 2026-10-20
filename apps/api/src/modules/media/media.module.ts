import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import type { Env } from '../../config/env.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AdminUploadsController } from './media.controller.js';
import { MediaService } from './media.service.js';
import { CloudinaryImageStorage } from './storage/cloudinary.storage.js';
import { FirebaseImageStorage } from './storage/firebase.storage.js';
import { LocalImageStorage } from './storage/local.storage.js';

@Module({
  imports: [
    SettingsModule,
    // Files are held in memory (no `dest`) so they can be checked before anything is stored.
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        limits: {
          fileSize: Math.round(config.get('UPLOAD_MAX_MB', { infer: true }) * 1024 * 1024),
          files: 1,
          fields: 5,
        },
      }),
    }),
  ],
  controllers: [AdminUploadsController],
  providers: [MediaService, LocalImageStorage, CloudinaryImageStorage, FirebaseImageStorage],
  exports: [MediaService],
})
export class MediaModule {}
