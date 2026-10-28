import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
  /** The admin's session version when signed in; tokens from before versions count as 0. */
  v?: number;
}

/** The signed-in admin as AdminGuard loads it on each request. */
export type CurrentAdminInfo = AdminUser & { sub: string };

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('nsb-timing-guard', 12);

/** After LOCK_AFTER wrong passwords, each within LOCK_MINUTES of the last, sign-in is refused for LOCK_MINUTES. */
const LOCK_AFTER = 10;
const LOCK_MINUTES = 15;

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
    if (row?.lockedUntil && row.lockedUntil > new Date()) {
      const minutes = Math.ceil((row.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new HttpException(`Too many wrong passwords. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`, HttpStatus.TOO_MANY_REQUESTS);
    }
    const ok = await bcrypt.compare(password, row?.passwordHash ?? DUMMY_HASH);
    if (!row) throw new UnauthorizedException('Invalid email or password');
    if (!ok) {
      await this.recordFailure(row.id);
      throw new UnauthorizedException('Invalid email or password');
    }
    if (row.failedLogins || row.lockedUntil) {
      await this.db.update(adminUsers).set({ failedLogins: 0, lastFailedAt: null, lockedUntil: null }).where(eq(adminUsers.id, row.id));
    }
    return { token: await this.sign(row), user: { id: row.id, email: row.email, name: row.name, role: row.role } };
  }

  private sign(row: { id: string; email: string; sessionVersion: number }) {
    const payload: SessionPayload = { sub: row.id, email: row.email, v: row.sessionVersion };
    return this.jwt.signAsync(payload);
  }

  /**
   * Counts a wrong password in one statement (so parallel guesses all count); the LOCK_AFTER-th
   * in a row locks the account. Postgres reads the old row in every SET expression.
   */
  private async recordFailure(id: string) {
    const streak = sql`case when ${adminUsers.lastFailedAt} > now() - make_interval(mins => ${LOCK_MINUTES}) then ${adminUsers.failedLogins} + 1 else 1 end`;
    await this.db
      .update(adminUsers)
      .set({
        failedLogins: sql`case when ${streak} >= ${LOCK_AFTER} then 0 else ${streak} end`,
        lockedUntil: sql`case when ${streak} >= ${LOCK_AFTER} then now() + make_interval(mins => ${LOCK_MINUTES}) else ${adminUsers.lockedUntil} end`,
        lastFailedAt: sql`now()`,
      })
      .where(eq(adminUsers.id, id));
  }

  /**
   * Sets a new password after checking the current one. A wrong current password is a 400 on
   * `currentPassword`, not a 401, which the admin panel would treat as an expired session.
   */
  async changePassword(id: string, { currentPassword, newPassword }: ChangePasswordInput): Promise<string> {
    const [row] = await this.db.select({ passwordHash: adminUsers.passwordHash }).from(adminUsers).where(eq(adminUsers.id, id));
    if (!row) throw new UnauthorizedException('Account no longer exists');
    if (!(await bcrypt.compare(currentPassword, row.passwordHash))) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Current password is incorrect',
        issues: [{ path: 'currentPassword', message: 'Current password is incorrect' }],
      });
    }
    // A new session version signs out every other session; this one gets a fresh token.
    const [updated] = await this.db
      .update(adminUsers)
      .set({ passwordHash: await bcrypt.hash(newPassword, 12), sessionVersion: sql`${adminUsers.sessionVersion} + 1` })
      .where(eq(adminUsers.id, id))
      .returning({ id: adminUsers.id, email: adminUsers.email, sessionVersion: adminUsers.sessionVersion });
    return this.sign(updated);
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

  /** The session's admin, if the session is still theirs: a password change since sign-in ends it. */
  async findSessionAdmin(session: SessionPayload): Promise<AdminUser> {
    const [row] = await this.db
      .select({ ...publicFields, sessionVersion: adminUsers.sessionVersion })
      .from(adminUsers)
      .where(eq(adminUsers.id, session.sub));
    if (!row) throw new UnauthorizedException('Account no longer exists');
    if ((session.v ?? 0) !== row.sessionVersion) throw new UnauthorizedException('Session expired, please sign in again');
    const { sessionVersion: _, ...admin } = row;
    return admin;
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
