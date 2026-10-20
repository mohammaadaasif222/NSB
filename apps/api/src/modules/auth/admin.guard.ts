import {
  type CanActivate,
  createParamDecorator,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SESSION_COOKIE } from '@nsb/shared';
import { AuthService, type SessionPayload } from './auth.service.js';

type AuthedRequest = Request & { admin?: SessionPayload };

/** Requires a valid admin session cookie. Apply with @UseGuards(AdminGuard). */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const token: unknown = req.cookies?.[SESSION_COOKIE];
    if (typeof token !== 'string' || !token) throw new UnauthorizedException('Not signed in');
    req.admin = await this.auth.verify(token);
    return true;
  }
}

/** The verified session of the current admin (only inside AdminGuard routes). */
export const CurrentAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SessionPayload =>
    ctx.switchToHttp().getRequest<AuthedRequest>().admin!,
);
