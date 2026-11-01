import { Global, Inject, Injectable, Logger, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import type { Env } from '../config/env.js';

export const DB = Symbol('DB');
export const PG_POOL = Symbol('PG_POOL');
export type Database = NodePgDatabase<typeof schema>;
/** The handle inside db.transaction(), for helpers that take part in one. */
export type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

@Injectable()
class PoolCloser implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        // Overload fails fast: a request gives up instead of queueing behind a slow query.
        const pool = new pg.Pool({
          connectionString: config.get('DATABASE_URL', { infer: true }),
          max: 10,
          connectionTimeoutMillis: 5_000,
          statement_timeout: 15_000,
          idle_in_transaction_session_timeout: 30_000,
        });
        // Without a listener, an idle connection dropping (a Postgres restart) crashes the process.
        pool.on('error', (err) => new Logger('Database').error('Idle connection failed', err));
        return pool;
      },
    },
    {
      provide: DB,
      inject: [PG_POOL],
      useFactory: (pool: pg.Pool): Database => drizzle(pool, { schema }),
    },
    PoolCloser,
  ],
  exports: [DB],
})
export class DbModule {}
