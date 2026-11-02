import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { and, asc, count, eq, gt, isNull, lte, ne, or, sql } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import {
  type AdminUser,
  type AdminUserInput,
  type AdminUserRow,
  type AdminUserUpdate,
  type ChangePasswordInput,
  type LoginInput,
  PASSWORD_RESET_MINUTES,
  type ProfileInput,
  type ResetPasswordInput,
} from '@nsb/shared';
import { DB, type Database, type Tx } from '../../db/db.module.js';
import { adminUsers } from '../../db/schema.js';
import { pgCode } from '../../common/db-errors.js';
import { NotificationsService } from '../notifications/notifications.service.js';

export interface SessionPayload {
  sub: string;
  email: string;
  /** The admin's session version when signed in; tokens from before versions count as 0. */
  v?: number;
}

/** The signed-in admin as AdminGuard loads it on each request. */
export type CurrentAdminInfo = AdminUser & { sub: string };

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('nsb-timing-guard', 12);

/**
 * After LOCK_AFTER wrong passwords from one address, each within LOCK_MINUTES of the last, that
 * address is refused for LOCK_MINUTES. Only that address: otherwise anyone who knows an admin's
 * email could keep them out.
 */
const LOCK_AFTER = 10;
const LOCK_MINUTES = 15;

/** One reset email per account in this time, so nobody can flood an admin's inbox from many addresses. */
const RESET_RESEND_MINUTES = 1;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Clears a reset link, once the password or the address it went to has changed. */
const noResetLink = { resetTokenHash: null, resetExpiresAt: null };

const publicFields = { id: adminUsers.id, email: adminUsers.email, name: adminUsers.name, role: adminUsers.role };

const emailTaken = () =>
  new ConflictException({
    statusCode: 409,
    message: 'An admin with this email already exists',
    issues: [{ path: 'email', message: 'An admin with this email already exists' }],
  });

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly jwt: JwtService,
    private readonly notifications: NotificationsService,
  ) {}

  async login({ email, password }: LoginInput, ip = ''): Promise<{ token: string; user: AdminUser }> {
    const [row] = await this.db.select().from(adminUsers).where(eq(adminUsers.email, email));
    const ok = await bcrypt.compare(password, row?.passwordHash ?? DUMMY_HASH);
    // The same reply as a wrong password, so a lock does not reveal that the account exists.
    const locked = row?.lockedUntil && row.lockedUntil > new Date() && row.lastFailedIp === ip;
    if (!row || locked) throw new UnauthorizedException('Invalid email or password');
    if (!ok) {
      await this.recordFailure(row.id, ip);
      throw new UnauthorizedException('Invalid email or password');
    }
    if (row.failedLogins || row.lockedUntil) {
      await this.db.update(adminUsers).set({ failedLogins: 0, lastFailedAt: null, lastFailedIp: null, lockedUntil: null }).where(eq(adminUsers.id, row.id));
    }
    return { token: await this.sign(row), user: { id: row.id, email: row.email, name: row.name, role: row.role } };
  }

  private sign(row: { id: string; email: string; sessionVersion: number }) {
    const payload: SessionPayload = { sub: row.id, email: row.email, v: row.sessionVersion };
    return this.jwt.signAsync(payload);
  }

  /**
   * Counts a wrong password in one statement (so parallel guesses all count); the LOCK_AFTER-th
   * in a row from one address locks it out. Postgres reads the old row in every SET expression.
   */
  private async recordFailure(id: string, ip: string) {
    const streak = sql`case when ${adminUsers.lastFailedAt} > now() - make_interval(mins => ${LOCK_MINUTES}) and ${adminUsers.lastFailedIp} = ${ip} then ${adminUsers.failedLogins} + 1 else 1 end`;
    await this.db
      .update(adminUsers)
      .set({
        failedLogins: sql`case when ${streak} >= ${LOCK_AFTER} then 0 else ${streak} end`,
        lockedUntil: sql`case when ${streak} >= ${LOCK_AFTER} then now() + make_interval(mins => ${LOCK_MINUTES}) else ${adminUsers.lockedUntil} end`,
        lastFailedAt: sql`now()`,
        lastFailedIp: ip,
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
      .set({ passwordHash: await bcrypt.hash(newPassword, 12), sessionVersion: sql`${adminUsers.sessionVersion} + 1`, ...noResetLink })
      .where(eq(adminUsers.id, id))
      .returning({ id: adminUsers.id, email: adminUsers.email, sessionVersion: adminUsers.sessionVersion });
    return this.sign(updated);
  }

  /**
   * Emails a reset link if the address is an admin's. Called after the reply, which is the same
   * either way, so neither its wording nor its timing reveals which emails exist. Only the token's
   * hash is stored, so a copy of the database cannot be used to reset a password.
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      const token = randomBytes(32).toString('base64url');
      const expiresAt = (minutes: number) => sql`now() + make_interval(mins => ${minutes})`;
      const [admin] = await this.db
        .update(adminUsers)
        .set({ resetTokenHash: hashToken(token), resetExpiresAt: expiresAt(PASSWORD_RESET_MINUTES) })
        .where(
          and(
            eq(adminUsers.email, email),
            or(isNull(adminUsers.resetExpiresAt), lte(adminUsers.resetExpiresAt, expiresAt(PASSWORD_RESET_MINUTES - RESET_RESEND_MINUTES))),
          ),
        )
        .returning({ email: adminUsers.email, name: adminUsers.name });
      if (admin) await this.notifications.passwordReset(admin, token);
    } catch (err) {
      this.logger.error('Could not send a password reset email', err);
    }
  }

  /** Sets the password from a reset link. Signs out every session, and clears any lock on the account. */
  async resetPassword({ token, newPassword }: ResetPasswordInput): Promise<void> {
    // One statement, so a link used twice at once only works once.
    const [row] = await this.db
      .update(adminUsers)
      .set({
        passwordHash: await bcrypt.hash(newPassword, 12),
        sessionVersion: sql`${adminUsers.sessionVersion} + 1`,
        ...noResetLink,
        failedLogins: 0,
        lastFailedAt: null,
        lastFailedIp: null,
        lockedUntil: null,
      })
      .where(and(eq(adminUsers.resetTokenHash, hashToken(token)), gt(adminUsers.resetExpiresAt, sql`now()`)))
      .returning({ id: adminUsers.id });
    if (!row) {
      const message = 'This reset link is invalid or has expired';
      throw new BadRequestException({ statusCode: 400, message, issues: [{ path: 'token', message }] });
    }
  }

  /** The signed-in admin's own name and email. The session stays valid: it is keyed by id. */
  async updateProfile(id: string, input: ProfileInput): Promise<AdminUser> {
    try {
      const [row] = await this.db.update(adminUsers).set({ ...input, ...noResetLink }).where(eq(adminUsers.id, id)).returning(publicFields);
      if (!row) throw new UnauthorizedException('Account no longer exists');
      return row;
    } catch (err) {
      if (pgCode(err) === '23505') throw emailTaken();
      throw err;
    }
  }

  /** Signing out ends all of this admin's sessions, so a copied cookie stops working too. A dead token has none to end. */
  async endSessions(token: string): Promise<void> {
    const session = await this.verify(token).catch(() => null);
    if (session) await this.db.update(adminUsers).set({ sessionVersion: sql`${adminUsers.sessionVersion} + 1` }).where(eq(adminUsers.id, session.sub));
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
