import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { Env } from '../../config/env.js';
import { AdminGuard } from './admin.guard.js';
import { AdminUsersController, AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

/** Global so every feature module can use AdminGuard without re-importing. */
@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: `${config.get('SESSION_TTL_DAYS', { infer: true })}d` },
      }),
    }),
  ],
  controllers: [AuthController, AdminUsersController],
  providers: [AuthService, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
