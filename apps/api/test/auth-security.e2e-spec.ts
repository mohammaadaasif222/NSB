import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import pg from 'pg';
import request from 'supertest';
import { SESSION_COOKIE } from '@nsb/shared';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { loadEnvFile } from '../src/config/env.js';
import { AuthService } from '../src/modules/auth/auth.service.js';

// Runs against the dev database (npm run db:up && npm run db:migrate && npm run db:seed).
loadEnvFile();

const run = Date.now().toString(36);
const email = `e2e-${run}-security@example.com`;
const PASSWORD = `e2e-${run}-first-pass`;

/**
 * Password changes and the account lock, on a throwaway admin: the seeded admin is shared with the
 * other e2e files, whose sessions a password change would end. The login route allows five tries a
 * minute per IP, so extra sessions are signed directly and some checks call AuthService.
 */
describe('Admin sign-in security (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  let superCookie: string;
  let userId: string;

  const http = () => request(app.getHttpServer());
  const cookieOf = (res: request.Response) => (res.headers['set-cookie'] as unknown as string[])[0].split(';')[0];
  /** A session as from a sign-in on another device, with the admin's current session version. */
  const session = async () => {
    const [{ session_version: v }] = (await pool.query('select session_version from admin_users where id = $1', [userId])).rows;
    return `${SESSION_COOKIE}=${await app.get(JwtService).signAsync({ sub: userId, email, v })}`;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
    await app.init();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    superCookie = cookieOf(
      await http().post('/api/auth/login').send({ email: process.env.SEED_ADMIN_EMAIL, password: process.env.SEED_ADMIN_PASSWORD }).expect(200),
    );
    const user = await http().post('/api/admin/users').set('Cookie', superCookie).send({ name: 'E2E Security', email, role: 'view', password: PASSWORD }).expect(201);
    userId = (user.body as { id: string }).id;
  });

  afterAll(async () => {
    await pool.query('delete from admin_users where id = $1', [userId]);
    await pool.end();
    await app.close();
  });

  it('asks for a strong new password', async () => {
    const weak = await http().post('/api/admin/users').set('Cookie', superCookie).send({ name: 'Weak', email: `weak-${email}`, role: 'view', password: 'short1' }).expect(400);
    expect(weak.body.issues.map((i: { path: string }) => i.path)).toContain('password');
    const repeated = await http().post('/api/admin/users').set('Cookie', superCookie).send({ name: 'Weak', email: `weak-${email}`, role: 'view', password: 'aaaaaaaaaaaa' }).expect(400);
    expect(repeated.body.issues).toContainEqual({ path: 'password', message: 'Use a mix of different characters' });
  });

  it('signs out the other sessions when the password changes, keeping this one', async () => {
    const mine = await session();
    const otherDevice = await session();
    const next = `e2e-${run}-second-pass`;
    const change = (body: object, cookie = mine) => http().post('/api/auth/password').set('Cookie', cookie).send(body);

    await http().post('/api/auth/password').send({ currentPassword: PASSWORD, newPassword: next, confirmPassword: next }).expect(401);
    const mismatch = await change({ currentPassword: PASSWORD, newPassword: next, confirmPassword: 'other-password' }).expect(400);
    expect(mismatch.body.issues).toEqual([{ path: 'confirmPassword', message: 'Passwords do not match' }]);
    const wrong = await change({ currentPassword: 'wrong-password', newPassword: next, confirmPassword: next }).expect(400);
    expect(wrong.body.issues).toEqual([{ path: 'currentPassword', message: 'Current password is incorrect' }]);
    const common = await change({ currentPassword: PASSWORD, newPassword: 'Password1234', confirmPassword: 'Password1234' }).expect(400);
    expect(common.body.issues).toContainEqual({ path: 'newPassword', message: 'This password is too common. Choose another.' });

    const fresh = cookieOf(await change({ currentPassword: PASSWORD, newPassword: next, confirmPassword: next }).expect(204));
    await http().get('/api/auth/me').set('Cookie', otherDevice).expect(401);
    await http().get('/api/auth/me').set('Cookie', mine).expect(401);
    await http().get('/api/auth/me').set('Cookie', fresh).expect(200);

    await expect(app.get(AuthService).login({ email, password: PASSWORD })).rejects.toThrow('Invalid email or password');
    await http().post('/api/auth/login').send({ email, password: next }).expect(200);
    await pool.query('update admin_users set failed_logins = 0, last_failed_at = null where id = $1', [userId]);
  });

  it('keeps sessions from before session versions signed in', async () => {
    const legacy = `${SESSION_COOKIE}=${await app.get(JwtService).signAsync({ sub: userId, email })}`;
    await pool.query('update admin_users set session_version = 0 where id = $1', [userId]);
    await http().get('/api/auth/me').set('Cookie', legacy).expect(200);
  });

  it('locks the account after ten wrong passwords in a row', async () => {
    const password = `e2e-${run}-second-pass`;
    // Nine misses straight in the database; the tenth through the route locks the account.
    await pool.query('update admin_users set failed_logins = 9, last_failed_at = now() where id = $1', [userId]);
    await http().post('/api/auth/login').send({ email, password: 'wrong-password' }).expect(401);
    const locked = await http().post('/api/auth/login').send({ email, password }).expect(429);
    expect(locked.body.message).toMatch(/^Too many wrong passwords\. Try again in 1[45] minutes\.$/);

    // Old misses do not add up: a streak resets after a quiet spell.
    await pool.query(`update admin_users set locked_until = null, failed_logins = 9, last_failed_at = now() - interval '1 hour' where id = $1`, [userId]);
    await expect(app.get(AuthService).login({ email, password: 'wrong-password' })).rejects.toThrow('Invalid email or password');
    let { rows } = await pool.query('select failed_logins, locked_until from admin_users where id = $1', [userId]);
    expect(rows[0]).toEqual({ failed_logins: 1, locked_until: null });

    // The right password clears the count.
    await app.get(AuthService).login({ email, password });
    ({ rows } = await pool.query('select failed_logins, locked_until from admin_users where id = $1', [userId]));
    expect(rows[0]).toEqual({ failed_logins: 0, locked_until: null });
  });
});
