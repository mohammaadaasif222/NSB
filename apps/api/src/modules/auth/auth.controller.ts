import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { CookieOptions, Response } from 'express';
import {
  type AdminUser,
  type AdminUserInput,
  adminUserInputSchema,
  type AdminUserRow,
  type AdminUserUpdate,
  adminUserUpdateSchema,
  type ChangePasswordInput,
  changePasswordSchema,
  type LoginInput,
  loginSchema,
  type ProfileInput,
  profileSchema,
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
  @Allow('view')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  changePassword(
    @CurrentAdmin() admin: CurrentAdminInfo,
    @Body(new ZodPipe(changePasswordSchema)) body: ChangePasswordInput,
  ): Promise<void> {
    return this.auth.changePassword(admin.sub, body);
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
