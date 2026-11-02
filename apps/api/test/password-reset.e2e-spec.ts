import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import pg from 'pg';
import request from 'supertest';
import { vi } from 'vitest';
import { SESSION_COOKIE } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { NotificationsService } from '../src/modules/notifications/notifications.service.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
const email = `e2e-${run}-reset@example.com`;
const PASSWORD = `e2e-${run}-first-pass`;

/**
 * Forgot password on a throwaway admin. The email itself is covered by the notifications spec; here
 * it is caught, because it carries the only copy of the token. The routes allow few tries a minute
 * per IP, so most links are issued by calling AuthService.
 */
describe('Admin forgot password (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let auth: AuthService;
  let userId: string;
  let emailed: ReturnType<typeof vi.spyOn>;

  const http = () => request(app.getHttpServer());
  const reset = (body: object) => http().post('/api/auth/reset-password').send(body);
  const strong = (n: number) => `e2e-${run}-new-pass-${n}`;
  const clearLink = () => pool.query('update admin_users set reset_token_hash = null, reset_expires_at = null where id = $1', [userId]);
  /** A fresh link's token, as the email would carry it. */
  const issueLink = async () => {
    await clearLink();
    emailed.mockClear();
    await auth.sendPasswordReset(email);
    return emailed.mock.calls[0][1] as string;
  };
  const session = async () => {
    const [{ session_version: v }] = (await pool.query('select session_version from admin_users where id = $1', [userId])).rows;
    return `${SESSION_COOKIE}=${await app.get(JwtService).signAsync({ sub: userId, email, v })}`;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    auth = app.get(AuthService);
    emailed = vi.spyOn(app.get(NotificationsService), 'passwordReset').mockResolvedValue(undefined);
    const { id } = await auth.createUser({ name: 'E2E Reset', email, role: 'view', password: PASSWORD });
    userId = id;
  });

  afterAll(async () => {
    await pool.query('delete from admin_users where id = $1', [userId]);
    await pool.end();
    await app.close();
  });

  it('answers the same for any address, and only emails an admin', async () => {
    await http().post('/api/auth/forgot-password').send({ email: 'not-an-email' }).expect(400);
    await http().post('/api/auth/forgot-password').send({ email: `nobody-${email}` }).expect(204);
    expect(emailed).not.toHaveBeenCalled();

    await http().post('/api/auth/forgot-password').send({ email }).expect(204);
    await vi.waitFor(() => expect(emailed).toHaveBeenCalledTimes(1));
    expect(emailed.mock.calls[0][0]).toEqual({ email, name: 'E2E Reset' });

    const token = emailed.mock.calls[0][1] as string;
    const { rows } = await pool.query('select reset_token_hash from admin_users where id = $1', [userId]);
    expect(rows[0].reset_token_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(rows[0].reset_token_hash).not.toContain(token);
  });

  it('sends one email a minute, however many addresses ask', async () => {
    await auth.sendPasswordReset(email);
    expect(emailed).toHaveBeenCalledTimes(1);
    await pool.query(`update admin_users set reset_expires_at = reset_expires_at - interval '2 minutes' where id = $1`, [userId]);
    await auth.sendPasswordReset(email);
    expect(emailed).toHaveBeenCalledTimes(2);
  });

  it('refuses a weak or mistyped password without using the link', async () => {
    const token = await issueLink();
    const weak = await reset({ token, newPassword: 'short1', confirmPassword: 'short1' }).expect(400);
    expect(weak.body.issues.map((i: { path: string }) => i.path)).toContain('newPassword');
    const mismatch = await reset({ token, newPassword: strong(1), confirmPassword: 'other-password' }).expect(400);
    expect(mismatch.body.issues).toEqual([{ path: 'confirmPassword', message: 'Passwords do not match' }]);
    await expect(auth.resetPassword({ token, newPassword: strong(1), confirmPassword: strong(1) })).resolves.toBeUndefined();
  });

  it('refuses a wrong, expired, replaced or already used link', async () => {
    const attempt = (token: string) => auth.resetPassword({ token, newPassword: strong(2), confirmPassword: strong(2) });
    const refused = 'This reset link is invalid or has expired';

    const wrong = await reset({ token: 'wrong-token', newPassword: strong(2), confirmPassword: strong(2) }).expect(400);
    expect(wrong.body.issues).toEqual([{ path: 'token', message: refused }]);

    const expired = await issueLink();
    await pool.query(`update admin_users set reset_expires_at = now() - interval '1 second' where id = $1`, [userId]);
    await expect(attempt(expired)).rejects.toThrow(refused);

    const first = await issueLink();
    await pool.query(`update admin_users set reset_expires_at = now() where id = $1`, [userId]);
    await auth.sendPasswordReset(email);
    const second = emailed.mock.calls.at(-1)![1] as string;
    await expect(attempt(first)).rejects.toThrow(refused);

    await attempt(second);
    await expect(attempt(second)).rejects.toThrow(refused);
  });

  it('sets the password, signs out every session and clears a lock', async () => {
    const token = await issueLink();
    const before = await session();
    await pool.query(`update admin_users set failed_logins = 3, last_failed_ip = '203.0.113.1', locked_until = now() + interval '10 minutes' where id = $1`, [userId]);

    await reset({ token, newPassword: strong(3), confirmPassword: strong(3) }).expect(204);

    await http().get('/api/auth/me').set('Cookie', before).expect(401);
    await expect(auth.login({ email, password: strong(2) })).rejects.toThrow('Invalid email or password');
    await expect(auth.login({ email, password: strong(3) }, '203.0.113.1')).resolves.toMatchObject({ user: { email } });
  });

  it('drops an open link when the password or email changes', async () => {
    const attempt = (token: string) => auth.resetPassword({ token, newPassword: strong(4), confirmPassword: strong(4) });

    const beforeChange = await issueLink();
    await auth.changePassword(userId, { currentPassword: strong(3), newPassword: strong(5), confirmPassword: strong(5) });
    await expect(attempt(beforeChange)).rejects.toThrow('invalid or has expired');

    const beforeProfile = await issueLink();
    await auth.updateProfile(userId, { name: 'E2E Reset', email });
    await expect(attempt(beforeProfile)).rejects.toThrow('invalid or has expired');
  });
});
