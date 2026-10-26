import bcrypt from 'bcryptjs';
import { count, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { loadEnvFile } from '../config/env.js';
import { adminUsers, banners, categories } from './schema.js';

loadEnvFile();

/**
 * Top-level categories shown on the home page, in the order of the home design.
 * Icons are served by the web app from /images/categories. Only Wedding has
 * sub-categories in Phase-1; the others show a "coming soon" page.
 */
const TOP_LEVEL = [
  ['Wedding', 'wedding'],
  ['Real Estate', 'real-estate'],
  ['Tattoo Studios', 'tattoo-studios'],
  ['Restaurants', 'restaurants'],
  ['Loans & Finance', 'loans-finance'],
  ['Interior Services', 'interior-services'],
  ['Beauty & Spa', 'beauty-spa'],
  ['Home Decor', 'home-decor'],
  ['Travel Services', 'travel-services'],
  ['Fitness & Gym', 'fitness-gym'],
  ['Electronics', 'electronics'],
  ['AC Repair', 'ac-repair'],
  ['Refurbished Laptops', 'refurbished-laptops'],
  ['Cafes', 'cafes'],
  ['Event Services', 'event-services'],
] as const;

/** The five Phase-1 wedding categories. More are added from the admin panel. */
const WEDDING = [
  ['Wedding Venues', 'wedding-venues', 'Banquet halls, lawns and party venues for every guest count.'],
  ['Makeup & Beauty', 'makeup-beauty', 'Bridal makeup artists, salons and mehendi for the big day.'],
  ['Catering & Halwai', 'catering-halwai', 'Caterers and halwais for wedding feasts and functions.'],
  ['Photography & Films', 'photography-films', 'Wedding photographers and filmmakers to capture every moment.'],
  ['Cards & Invitations', 'cards-invitations', 'Wedding cards, e-invites and gift hampers.'],
] as const;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

try {
  await db
    .insert(categories)
    .values(
      TOP_LEVEL.map(([name, slug], sortOrder) => ({
        name,
        slug,
        sortOrder,
        imageUrl: `/images/categories/${slug}.png`,
        description:
          slug === 'wedding'
            ? 'Trusted wedding vendors in Noida, Greater Noida and Greater Noida West.'
            : null,
      })),
    )
    .onConflictDoNothing({ target: categories.slug });

  const [wedding] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(sql`${categories.slug} = 'wedding'`);

  // Insert; for rows seeded before categories had parents, fill only the blank fields
  // so admin edits are never overwritten.
  await db
    .insert(categories)
    .values(
      WEDDING.map(([name, slug, description], sortOrder) => ({
        name,
        slug,
        description,
        sortOrder,
        parentId: wedding.id,
      })),
    )
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        parentId: sql`coalesce(${categories.parentId}, excluded.parent_id)`,
        description: sql`coalesce(${categories.description}, excluded.description)`,
      },
    });
  console.log(`Categories ensured: ${TOP_LEVEL.length} top-level, ${WEDDING.length} wedding`);

  const [{ banners: bannerCount }] = await db.select({ banners: count() }).from(banners);
  if (bannerCount === 0) {
    await db.insert(banners).values([
      {
        heading: 'Discover Noida',
        subheading: 'Your complete local marketplace',
        ctaLabel: 'Explore Now',
        ctaLink: '#categories',
        sortOrder: 0,
      },
      {
        heading: 'Plan your dream wedding',
        subheading: 'Venues, makeup, catering and more in Noida',
        ctaLabel: 'Explore Wedding',
        ctaLink: '/wedding',
        sortOrder: 1,
      },
    ]);
    console.log('Default hero banners created');
  }

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 10) throw new Error('SEED_ADMIN_PASSWORD must be at least 10 characters');
    await db
      .insert(adminUsers)
      .values({
        email,
        name: process.env.SEED_ADMIN_NAME ?? 'NSB Admin',
        passwordHash: await bcrypt.hash(password, 12),
      })
      .onConflictDoNothing({ target: adminUsers.email });
    console.log(`Admin user ensured: ${email}`);
  } else {
    console.log('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipped admin user');
  }
} finally {
  await pool.end();
}
