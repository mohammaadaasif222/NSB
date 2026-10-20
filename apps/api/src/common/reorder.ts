import { NotFoundException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Database } from '../db/db.module.js';
import type { banners, categories } from '../db/schema.js';

/**
 * Sets sort_order to each id's position in `ids` in one statement. All or nothing: if any id
 * is unknown, nothing changes.
 */
export async function reorderRows(
  db: Database,
  table: typeof banners | typeof categories,
  ids: string[],
  what: string,
): Promise<void> {
  const unique = [...new Set(ids)];
  const list = sql.join(
    unique.map((id) => sql`${id}`),
    sql`, `,
  );
  await db.transaction(async (tx) => {
    const result = await tx.execute(sql`
      update ${table} set sort_order = v.ord - 1, updated_at = now()
      from unnest(array[${list}]::uuid[]) with ordinality as v(id, ord)
      where ${table.id} = v.id`);
    if (result.rowCount !== unique.length) throw new NotFoundException(`Unknown ${what} id`);
  });
}
