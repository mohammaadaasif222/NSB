import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import {
  type AdminUser,
  type ChangePasswordInput,
  changePasswordSchema,
  type LoginInput,
  loginSchema,
  SESSION_COOKIE,
} from '@nsb/shared';
import type { Env } from '../../config/env.js';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard, CurrentAdmin } from './admin.guard.js';
import { AuthService, type SessionPayload } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.config.get('COOKIE_SECURE', { infer: true }),
      path: '/',
    };
  }

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body(new ZodPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AdminUser> {
    const { token, user } = await this.auth.login(body);
    const days = this.config.get('SESSION_TTL_DAYS', { infer: true });
    res.cookie(SESSION_COOKIE, token, { ...this.cookieOptions(), maxAge: days * 86_400_000 });
    return user;
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }

  /** The signed-in admin changes their own password; their current session stays signed in. */
  @Post('password')
  @HttpCode(204)
  @UseGuards(AdminGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  changePassword(
    @CurrentAdmin() session: SessionPayload,
    @Body(new ZodPipe(changePasswordSchema)) body: ChangePasswordInput,
  ): Promise<void> {
    return this.auth.changePassword(session.sub, body);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@CurrentAdmin() session: SessionPayload): Promise<AdminUser> {
    return this.auth.findAdmin(session.sub);
  }
}
