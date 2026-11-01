import { and, eq, isNull, or, type SQL, sql } from 'drizzle-orm';
import { alias, type PgSelectBase, type SelectedFields } from 'drizzle-orm/pg-core';
import type { LocationFilter } from '@nsb/shared';
import type { Database } from '../../db/db.module.js';
import { categories, listings } from '../../db/schema.js';

export const categoryRef = { id: categories.id, name: categories.name, slug: categories.slug };

/** The parent of the listing's category, for visibility checks and parent filters. */
export const parentCategory = alias(categories, 'parent_category');

type CategoryJoin = { listings: 'not-null'; categories: 'not-null'; parent_category: 'nullable' };

/**
 * Selects from listings joined to their category and, when it has one, that category's parent.
 * The cast restores what Drizzle infers for a written-out join, which it cannot do for a generic selection.
 */
export const withCategory = <T extends SelectedFields>(db: Database, fields: T) =>
  db
    .select(fields as SelectedFields)
    .from(listings)
    .innerJoin(categories, eq(listings.categoryId, categories.id))
    .leftJoin(parentCategory, eq(categories.parentId, parentCategory.id)) as unknown as PgSelectBase<'listings', T, 'partial', CategoryJoin>;

/** Public pages show a listing only while it is Live and its category, and that category's parent, are active. */
export const visible = and(
  eq(listings.status, 'live'),
  eq(categories.isActive, true),
  or(isNull(parentCategory.id), eq(parentCategory.isActive, true)),
)!;

/** Localities are typed by hand, so "Sector 18" and " sector 18" are the same place. */
export const localityKey = sql<string>`lower(btrim(${listings.locality}))`;

/** Conditions for the site's location filter (an area, optionally narrowed to a locality). */
export const locationFilters = ({ area, locality }: LocationFilter): SQL[] => [
  ...(area ? [eq(listings.area, area)] : []),
  ...(locality ? [sql`${localityKey} = lower(${locality.trim()})`] : []),
];
