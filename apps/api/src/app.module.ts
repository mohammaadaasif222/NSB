import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { validateEnv } from './config/env.js';
import { DbModule } from './db/db.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { BannersModule } from './modules/banners/banners.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { EnquiriesModule } from './modules/enquiries/enquiries.module.js';
import { HealthController } from './modules/health/health.controller.js';
import { ListingsModule } from './modules/listings/listings.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv, envFilePath: '.env' }),
    // Limits are set per route with @Throttle; this is only the fallback.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    DbModule,
    AuthModule,
    CategoriesModule,
    ListingsModule,
    ProjectsModule,
    BannersModule,
    EnquiriesModule,
    SettingsModule,
    MediaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
