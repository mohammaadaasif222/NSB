import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import type { Env } from './config/env.js';
import { LOCAL_UPLOADS_PATH, uploadRoot } from './modules/media/storage/local.storage.js';

/** HTTP setup shared by main.ts and the e2e tests. */
export function configureApp(app: NestExpressApplication): NestExpressApplication {
  // Behind Caddy in production: trust it for client IPs (rate limiting) and https detection.
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cookieParser());
  // Locally stored uploads. File names are random and never reused, so they can be cached forever.
  app.useStaticAssets(uploadRoot(app.get<ConfigService<Env, true>>(ConfigService)), {
    prefix: `${LOCAL_UPLOADS_PATH}/`,
    index: false,
    dotfiles: 'deny',
    immutable: true,
    maxAge: '365d',
  });
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  return app;
}
