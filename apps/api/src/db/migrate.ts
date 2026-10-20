import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import { loadEnvFile } from '../config/env.js';

loadEnvFile();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  await migrate(drizzle(pool), { migrationsFolder: 'drizzle' });
  console.log('Migrations applied');
} finally {
  await pool.end();
}
