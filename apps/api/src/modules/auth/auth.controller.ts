import { Body, Controller, Delete, Get, HttpCode, Ip, Param, ParseUUIDPipe, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import {
  type AdminUser,
  type AdminUserInput,
  adminUserInputSchema,
  type AdminUserRow,
  type AdminUserUpdate,
  adminUserUpdateSchema,
  type ChangePasswordInput,
  changePasswordSchema,
  type ForgotPasswordInput,
  forgotPasswordSchema,
  type LoginInput,
  loginSchema,
  type ProfileInput,
  profileSchema,
  type ResetPasswordInput,
  resetPasswordSchema,
  SESSION_COOKIE,
} from '@nsb/shared';
import type { Env } from '../../config/env.js';
import { ZodPipe } from '../../common/zod.pipe.js';
import { AdminGuard, Allow, CurrentAdmin } from './admin.guard.js';
import { AuthService, type CurrentAdminInfo } from './auth.service.js';

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
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AdminUser> {
    const { token, user } = await this.auth.login(body, ip);
    this.setSession(res, token);
    return user;
  }

  private setSession(res: Response, token: string) {
    const days = this.config.get('SESSION_TTL_DAYS', { infer: true });
    res.cookie(SESSION_COOKIE, token, { ...this.cookieOptions(), maxAge: days * 86_400_000 });
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token === 'string') await this.auth.endSessions(token);
    res.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }

  /**
   * The signed-in admin changes their own password. Their other sessions (other devices, or a
   * stolen cookie) are signed out; this one stays signed in with a fresh cookie.
   */
  @Post('password')
  @HttpCode(204)
  @UseGuards(AdminGuard, ThrottlerGuard)
  @Allow('view')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async changePassword(
    @CurrentAdmin() admin: CurrentAdminInfo,
    @Body(new ZodPipe(changePasswordSchema)) body: ChangePasswordInput,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.setSession(res, await this.auth.changePassword(admin.sub, body));
  }

  /** Always a 204: the link is emailed after the reply, and only to an admin's address. */
  @Post('forgot-password')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  forgotPassword(@Body(new ZodPipe(forgotPasswordSchema)) { email }: ForgotPasswordInput): void {
    void this.auth.sendPasswordReset(email);
  }

  /** Every session ends, so the admin signs in again with the new password. */
  @Post('reset-password')
  @HttpCode(204)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  resetPassword(@Body(new ZodPipe(resetPasswordSchema)) body: ResetPasswordInput): Promise<void> {
    return this.auth.resetPassword(body);
  }

  /** The signed-in admin's own name and email (any role). */
  @Patch('profile')
  @UseGuards(AdminGuard)
  @Allow('view')
  updateProfile(@CurrentAdmin() admin: CurrentAdminInfo, @Body(new ZodPipe(profileSchema)) body: ProfileInput): Promise<AdminUser> {
    return this.auth.updateProfile(admin.sub, body);
  }

  @Get('me')
  @UseGuards(AdminGuard)
  me(@CurrentAdmin() admin: CurrentAdminInfo): AdminUser {
    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
  }
}

/** Settings › Users and roles: Super Admins only. */
@Controller('admin/users')
@UseGuards(AdminGuard)
@Allow('manage')
export class AdminUsersController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  list(): Promise<AdminUserRow[]> {
    return this.auth.listUsers();
  }

  @Post()
  create(@Body(new ZodPipe(adminUserInputSchema)) body: AdminUserInput): Promise<AdminUserRow> {
    return this.auth.createUser(body);
  }

  @Patch(':id')
  update(
    @CurrentAdmin() admin: CurrentAdminInfo,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodPipe(adminUserUpdateSchema)) body: AdminUserUpdate,
  ): Promise<AdminUserRow> {
    return this.auth.updateUser(admin.id, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentAdmin() admin: CurrentAdminInfo, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.auth.removeUser(admin.id, id);
  }
}
