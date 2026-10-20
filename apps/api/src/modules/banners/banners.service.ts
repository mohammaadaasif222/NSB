import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import type { Banner, BannerInput, BannerUpdate } from '@nsb/shared';
import { DB, type Database } from '../../db/db.module.js';
import { banners } from '../../db/schema.js';
import { reorderRows } from '../../common/reorder.js';
import { MediaService } from '../media/media.service.js';

const columns = {
  id: banners.id,
  imageUrl: banners.imageUrl,
  mobileImageUrl: banners.mobileImageUrl,
  heading: banners.heading,
  subheading: banners.subheading,
  ctaLabel: banners.ctaLabel,
  ctaLink: banners.ctaLink,
  isActive: banners.isActive,
  sortOrder: banners.sortOrder,
};

const images = (b: Pick<Banner, 'imageUrl' | 'mobileImageUrl'>) => [b.imageUrl, b.mobileImageUrl];

@Injectable()
export class BannersService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly media: MediaService,
  ) {}

  list({ activeOnly }: { activeOnly: boolean }): Promise<Banner[]> {
    return this.db
      .select(columns)
      .from(banners)
      .where(activeOnly ? eq(banners.isActive, true) : undefined)
      .orderBy(asc(banners.sortOrder), asc(banners.createdAt));
  }

  async create(input: BannerInput): Promise<Banner> {
    const [row] = await this.db
      .insert(banners)
      .values({
        ...input,
        // New banners go to the end unless an order is given.
        sortOrder: input.sortOrder ?? sql`(select coalesce(max(${banners.sortOrder}) + 1, 0) from ${banners})`,
      })
      .returning(columns);
    return row;
  }

  async update(id: string, input: BannerUpdate): Promise<Banner> {
    const before = await this.findOne(id);
    if (Object.keys(input).length === 0) return before;
    const [row] = await this.db.update(banners).set(input).where(eq(banners.id, id)).returning(columns);
    if (!row) throw new NotFoundException('Banner not found');
    await this.media.release(images(before));
    return row;
  }

  async reorder(ids: string[]): Promise<Banner[]> {
    await reorderRows(this.db, banners, ids, 'banner');
    return this.list({ activeOnly: false });
  }

  async remove(id: string): Promise<void> {
    const [row] = await this.db
      .delete(banners)
      .where(eq(banners.id, id))
      .returning({ imageUrl: banners.imageUrl, mobileImageUrl: banners.mobileImageUrl });
    if (!row) throw new NotFoundException('Banner not found');
    await this.media.release(images(row));
  }

  private async findOne(id: string): Promise<Banner> {
    const [row] = await this.db.select(columns).from(banners).where(eq(banners.id, id));
    if (!row) throw new NotFoundException('Banner not found');
    return row;
  }
}
