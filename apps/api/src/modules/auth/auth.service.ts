import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { AdminUser, ChangePasswordInput, LoginInput } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { adminUsers } from '../../db/schema.js';

export interface SessionPayload {
  sub: string;
  email: string;
}

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('nsb-timing-guard', 12);

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly jwt: JwtService,
  ) {}

  async login({ email, password }: LoginInput): Promise<{ token: string; user: AdminUser }> {
    const [row] = await this.db.select().from(adminUsers).where(eq(adminUsers.email, email));
    const ok = await bcrypt.compare(password, row?.passwordHash ?? DUMMY_HASH);
    if (!row || !ok) throw new UnauthorizedException('Invalid email or password');

    const payload: SessionPayload = { sub: row.id, email: row.email };
    return {
      token: await this.jwt.signAsync(payload),
      user: { id: row.id, email: row.email, name: row.name },
    };
  }

  /**
   * Sets a new password after checking the current one. A wrong current password is a 400 on
   * `currentPassword`, not a 401, which the admin panel would treat as an expired session.
   */
  async changePassword(id: string, { currentPassword, newPassword }: ChangePasswordInput): Promise<void> {
    const [row] = await this.db.select({ passwordHash: adminUsers.passwordHash }).from(adminUsers).where(eq(adminUsers.id, id));
    if (!row) throw new UnauthorizedException('Account no longer exists');
    if (!(await bcrypt.compare(currentPassword, row.passwordHash))) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Current password is incorrect',
        issues: [{ path: 'currentPassword', message: 'Current password is incorrect' }],
      });
    }
    await this.db
      .update(adminUsers)
      .set({ passwordHash: await bcrypt.hash(newPassword, 12) })
      .where(eq(adminUsers.id, id));
  }

  async verify(token: string): Promise<SessionPayload> {
    try {
      return await this.jwt.verifyAsync<SessionPayload>(token);
    } catch {
      throw new UnauthorizedException('Session expired, please sign in again');
    }
  }

  async findAdmin(id: string): Promise<AdminUser> {
    const [row] = await this.db
      .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name })
      .from(adminUsers)
      .where(eq(adminUsers.id, id));
    if (!row) throw new UnauthorizedException('Account no longer exists');
    return row;
  }
}
