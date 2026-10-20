import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, eq, inArray, isNull, type SQL, sql } from 'drizzle-orm';
import type { AdminCategory, Category, CategoryDetail, CategoryInput, CategoryUpdate } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { categories, listings } from '../../db/schema.js';
import { pgCode, rethrowDbError } from '../../common/db-errors.js';
import { reorderRows } from '../../common/reorder.js';
import { MediaService } from '../media/media.service.js';

const columns = {
  id: categories.id,
  parentId: categories.parentId,
  name: categories.name,
  slug: categories.slug,
  description: categories.description,
  imageUrl: categories.imageUrl,
  isActive: categories.isActive,
  sortOrder: categories.sortOrder,
};

const order = [asc(categories.sortOrder), asc(categories.name)];
const active = eq(categories.isActive, true);

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly media: MediaService,
  ) {}

  /** Active top-level categories, or the active sub-categories of `parentSlug`. */
  async list(parentSlug?: string): Promise<Category[]> {
    if (!parentSlug) {
      return this.db
        .select(columns)
        .from(categories)
        .where(and(isNull(categories.parentId), active))
        .orderBy(...order);
    }
    const parent = await this.findOne(and(eq(categories.slug, parentSlug), active)!);
    return this.children(parent.id, { activeOnly: true });
  }

  /** Every category, active or not, for the admin panel. */
  listAll(): Promise<AdminCategory[]> {
    return this.db
      .select({ ...columns, listingCount: count(listings.id) })
      .from(categories)
      .leftJoin(listings, eq(listings.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(...order);
  }

  /** Public category page. Hidden when it or its parent is inactive. */
  async getBySlug(slug: string): Promise<CategoryDetail> {
    const category = await this.findOne(and(eq(categories.slug, slug), active)!);
    const [parent, children] = await Promise.all([
      category.parentId ? this.findOne(and(eq(categories.id, category.parentId), active)!) : null,
      category.parentId ? [] : this.children(category.id, { activeOnly: true }),
    ]);
    return {
      ...category,
      parent: parent && { id: parent.id, name: parent.name, slug: parent.slug },
      children,
    };
  }

  async create(input: CategoryInput): Promise<Category> {
    await this.assertValidParent(input.parentId);
    try {
      // New categories go to the end of their list.
      const [row] = await this.db
        .insert(categories)
        .values({
          ...input,
          sortOrder: sql`(select coalesce(max(${categories.sortOrder}) + 1, 0) from ${categories})`,
        })
        .returning(columns);
      return row;
    } catch (err) {
      rethrowDbError(err, 'Category');
    }
  }

  async update(id: string, input: CategoryUpdate): Promise<Category> {
    const before = await this.findOne(eq(categories.id, id));
    if (Object.keys(input).length === 0) return before;
    if (input.parentId) {
      if (input.parentId === id) throw new BadRequestException('A category cannot be its own parent');
      await this.assertValidParent(input.parentId);
      const [child] = await this.children(id);
      if (child) throw new BadRequestException('A category with sub-categories cannot be moved under another');
    }
    let row: Category | undefined;
    try {
      [row] = await this.db.update(categories).set(input).where(eq(categories.id, id)).returning(columns);
    } catch (err) {
      rethrowDbError(err, 'Category');
    }
    if (!row) throw new NotFoundException('Category not found');
    await this.media.release([before.imageUrl]);
    return row;
  }

  /** Sets the order of one sibling group: top-level categories, or one parent's sub-categories. */
  async reorder(ids: string[]): Promise<AdminCategory[]> {
    const parents = await this.db
      .selectDistinct({ parentId: categories.parentId })
      .from(categories)
      .where(inArray(categories.id, ids));
    if (parents.length > 1) throw new BadRequestException('Only categories with the same parent can be reordered together');
    await reorderRows(this.db, categories, ids, 'category');
    return this.listAll();
  }

  /** Deletes an empty category. Sub-categories and listings must be moved or deleted first. */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(eq(categories.id, id));
    const [[{ children }], [{ listed }]] = await Promise.all([
      this.db.select({ children: count() }).from(categories).where(eq(categories.parentId, id)),
      this.db.select({ listed: count() }).from(listings).where(eq(listings.categoryId, id)),
    ]);
    if (children > 0) {
      throw new ConflictException(`"${category.name}" has ${children} sub-categories. Move or delete them first.`);
    }
    if (listed > 0) {
      throw new ConflictException(`"${category.name}" has ${listed} listings. Move them to another category first.`);
    }
    try {
      await this.db.delete(categories).where(eq(categories.id, id));
    } catch (err) {
      // A listing or sub-category added since the check above.
      if (pgCode(err) === '23503') {
        throw new ConflictException(`"${category.name}" is no longer empty`);
      }
      throw err;
    }
    await this.media.release([category.imageUrl]);
  }

  private children(parentId: string, { activeOnly = false } = {}): Promise<Category[]> {
    return this.db
      .select(columns)
      .from(categories)
      .where(and(eq(categories.parentId, parentId), activeOnly ? active : undefined))
      .orderBy(...order);
  }

  private async findOne(where: SQL): Promise<Category> {
    const [row] = await this.db.select(columns).from(categories).where(where);
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }

  /** Only two levels: a parent must itself be top-level. */
  private async assertValidParent(parentId: string | null | undefined) {
    if (!parentId) return;
    const [parent] = await this.db.select(columns).from(categories).where(eq(categories.id, parentId));
    if (!parent) throw new BadRequestException('Parent category does not exist');
    if (parent.parentId) throw new BadRequestException('Sub-categories cannot have their own sub-categories');
  }
}
