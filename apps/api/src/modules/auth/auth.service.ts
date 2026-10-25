import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { and, asc, count, eq, ne, sql } from 'drizzle-orm';
import type { AdminUser, AdminUserInput, AdminUserRow, AdminUserUpdate, ChangePasswordInput, LoginInput, ProfileInput } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { adminUsers } from '../../db/schema.js';
import { pgCode } from '../../common/db-errors.js';

export interface SessionPayload {
  sub: string;
  email: string;
}

/** The signed-in admin as AdminGuard loads it on each request. */
export type CurrentAdminInfo = AdminUser & { sub: string };

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('nsb-timing-guard', 12);

const publicFields = { id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role };

const emailTaken = () =>
  new ConflictException({
    statusCode: 409,
    message: 'An admin with this email already exists',
    issues: [{ path: 'email', message: 'An admin with this email already exists' }],
  });

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
      user: { id: row.id, email: row.email, name: row.name, role: row.role },
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

  /** The signed-in admin's own name and email. The session stays valid: it is keyed by id. */
  async updateProfile(id: string, input: ProfileInput): Promise<AdminUser> {
    try {
      const [row] = await this.db.update(adminUsers).set(input).where(eq(adminUsers.id, id)).returning(publicFields);
      if (!row) throw new UnauthorizedException('Account no longer exists');
      return row;
    } catch (err) {
      if (pgCode(err) === '23505') throw emailTaken();
      throw err;
    }
  }

  async verify(token: string): Promise<SessionPayload> {
    try {
      return await this.jwt.verifyAsync<SessionPayload>(token);
    } catch {
      throw new UnauthorizedException('Session expired, please sign in again');
    }
  }

  async findAdmin(id: string): Promise<AdminUser> {
    const [row] = await this.db.select(publicFields).from(adminUsers).where(eq(adminUsers.id, id));
    if (!row) throw new UnauthorizedException('Account no longer exists');
    return row;
  }

  // ---------- Users and roles (Super Admin) ----------

  async listUsers(): Promise<AdminUserRow[]> {
    const rows = await this.db
      .select({ ...publicFields, createdAt: adminUsers.createdAt })
      .from(adminUsers)
      .orderBy(asc(adminUsers.createdAt));
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  }

  async createUser({ password, ...input }: AdminUserInput): Promise<AdminUserRow> {
    try {
      const [row] = await this.db
        .insert(adminUsers)
        .values({ ...input, passwordHash: await bcrypt.hash(password, 12) })
        .returning({ ...publicFields, createdAt: adminUsers.createdAt });
      return { ...row, createdAt: row.createdAt.toISOString() };
    } catch (err) {
      if (pgCode(err) === '23505') throw emailTaken();
      throw err;
    }
  }

  /** Changes another admin's role. Nobody changes their own, so a Super Admin can't lock themselves out. */
  async updateUser(actorId: string, id: string, { role }: AdminUserUpdate): Promise<AdminUserRow> {
    if (id === actorId) throw new BadRequestException('You cannot change your own role');
    const row = await this.db.transaction(async (tx) => {
      const target = await this.userRow(id, tx);
      if (target.role === 'super' && role !== 'super') await this.assertAnotherSuper(id, tx);
      const [updated] = await tx.update(adminUsers).set({ role }).where(eq(adminUsers.id, id)).returning({ ...publicFields, createdAt: adminUsers.createdAt });
      return updated;
    });
    return { ...row, createdAt: row.createdAt.toISOString() };
  }

  /** Removes another admin; their session stops working on its next request. */
  async removeUser(actorId: string, id: string): Promise<void> {
    if (id === actorId) throw new BadRequestException('You cannot remove your own account');
    await this.db.transaction(async (tx) => {
      const target = await this.userRow(id, tx);
      if (target.role === 'super') await this.assertAnotherSuper(id, tx);
      await tx.delete(adminUsers).where(eq(adminUsers.id, id));
    });
  }

  private async userRow(id: string, db: Database | Tx = this.db) {
    const [row] = await db.select(publicFields).from(adminUsers).where(eq(adminUsers.id, id));
    if (!row) throw new NotFoundException('User not found');
    return row;
  }

  /**
   * At least one Super Admin must remain. Inside the caller's transaction, under a lock, so two
   * Super Admins demoting or removing each other at once cannot both pass.
   */
  private async assertAnotherSuper(exceptId: string, tx: Tx) {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('nsb:admin-roles'))`);
    const [{ supers }] = await tx
      .select({ supers: count() })
      .from(adminUsers)
      .where(and(eq(adminUsers.role, 'super'), ne(adminUsers.id, exceptId)));
    if (supers === 0) throw new BadRequestException('Keep at least one Super Admin');
  }
}
