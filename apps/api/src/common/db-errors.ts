import { BadRequestException, ConflictException } from '@nestjs/common';

/** Postgres error code, whether thrown directly by pg or wrapped by Drizzle. */
export function pgCode(err: unknown): string | undefined {
  const e = err as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = e?.code ?? e?.cause?.code;
  return typeof code === 'string' ? code : undefined;
}

/** Maps constraint violations to 4xx responses; rethrows anything else. */
export function rethrowDbError(err: unknown, what = 'Record'): never {
  switch (pgCode(err)) {
    case '23505':
      throw new ConflictException(`${what} with this slug already exists`);
    case '23503':
      throw new BadRequestException('A referenced record does not exist');
    default:
      throw err;
  }
}
