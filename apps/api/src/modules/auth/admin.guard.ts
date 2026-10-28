import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ADMIN_ROLE_LABELS, type AdminPermission, canDo, SESSION_COOKIE } from '@nsb/shared';
import { AuthService, type CurrentAdminInfo } from './auth.service.js';

type AuthedRequest = Request & { admin?: CurrentAdminInfo };

const PERMISSION_KEY = 'nsb:permission';

/**
 * The permission a route needs (ADMIN_PERMISSIONS). Without it, reads need "view" and changes
 * (POST, PATCH, PUT, DELETE) need "edit".
 */
export const Allow = (permission: AdminPermission) => SetMetadata(PERMISSION_KEY, permission);

/**
 * Requires a valid admin session cookie and a role allowed to use the route. The admin is read
 * from the database on every request, so a changed role, a removed user or a password change
 * (which ends the admin's other sessions) takes effect at once.
 * Apply with @UseGuards(AdminGuard).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token !== 'string' || !token) throw new UnauthorizedException('Not signed in');
    const session = await this.auth.verify(token);
    const admin = await this.auth.findSessionAdmin(session);
    req.admin = { ...admin, sub: admin.id };

    const required =
      this.reflector.getAllAndOverride<AdminPermission | undefined>(PERMISSION_KEY, [ctx.getHandler(), ctx.getClass()]) ??
      (req.method === 'GET' || req.method === 'HEAD' ? 'view' : 'edit');
    if (!canDo(admin.role, required)) {
      throw new ForbiddenException(`${ADMIN_ROLE_LABELS[admin.role]} accounts cannot do this. Ask a Super Admin.`);
    }
    return true;
  }
}

/** The signed-in admin (only inside AdminGuard routes), with their current role. */
export const CurrentAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentAdminInfo => ctx.switchToHttp().getRequest<AuthedRequest>().admin!,
);
