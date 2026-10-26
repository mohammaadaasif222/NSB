import { and, eq, inArray, like, min, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import type { ListingVideo, QuickInfoItem } from '@nsb/shared';
import { loadEnvFile } from '../config/env.js';
import { projectValues } from '../modules/projects/project-values.js';
import { demoProjects } from './demo-projects.js';
import { banners, categories, listingImages, listings, projects } from './schema.js';

/**
 * Demo vendors, real estate projects and hero banners for design review and testing. Not real businesses.
 *   npm run db:seed:demo             add them (skips any that already exist)
 *   npm run db:seed:demo -- --remove delete them before launch
 * Every demo vendor uses an @example.com email, so enquiry alerts never reach a real inbox.
 * Demo banners are recognised by their image URL, so --remove never touches admin-made banners.
 * Photos are hotlinked from Unsplash (free licence), as Unsplash asks. Videos are public YouTube
 * videos and Shorts by other creators that allow embedding, there only to show the Videos section.
 * Re-running the seed adds videos to demo vendors seeded before videos existed.
 */

loadEnvFile();

const DEMO_EMAIL_DOMAIN = '@example.com';
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

const VENUE_PHOTOS = [
  '1542665952-14513db15293', '1775918427144-51f0bf53f8c4', '1524824267900-2fa9cbf7a506',
  '1780593116478-c46838f86523', '1526568929-7cdd510e77fd', '1666617710768-425d2d9088f8',
  '1549895058-36748fa6c6a7', '1677129663241-5be1f17fe6fe', '1761114905078-163aa92141c8',
  '1779308936221-89739e035a53', '1783314867628-220ab03cac99', '1765947384834-3bdcffcaffff',
  '1763553113332-800519753e40', '1780542900375-0cf459e38fbb', '1744805624954-a6686543c3ff',
  '1761472606347-bfebc5a3e546', '1772127822562-a898d9f5733c', '1772127822552-ce9ef537bdcf',
  '1772127822525-7eda37383b9f', '1587271407850-8d438ca9fdf2',
];
const MAKEUP_PHOTOS = [
  '1684868268327-7e5590bcfbd6', '1610047614301-13c63f00c032', '1610173827043-9db50e0d8ef9',
  '1684868265714-fd2300637c23', '1600685890506-593fdf55949b', '1684868682581-4cac3af5b8d4',
  '1617633150878-7df1d12a9a57', '1677691257363-eebd2abeafec', '1512496015851-a90fb38ba796',
];
const CATERING_PHOTOS = [
  '1742281257687-092746ad6021', '1555244162-803834f70033', '1576842546422-60562b9242ae',
  '1742281258189-3b933879867a', '1564638305579-5e395c9b62c7', '1616668856493-9df876327739',
  '1742281257707-0c7f7e5ca9c6', '1724218012292-5548214cc2d2', '1571162478581-ad3d0c1057ab',
];
const PHOTOGRAPHY_PHOTOS = [
  '1630526720753-aa4e71acf67d', '1629756048377-09540f52caa1', '1519741497674-611481863552',
  '1519741196428-6a2175fa2557', '1611550287705-7ff8b459c8eb', '1600164913117-2125c1f60b01',
  '1722805740177-04256b6517f2', '1503525443530-339273ca8a86', '1630526720753-aa4e71acf67d',
];
const INVITATION_PHOTOS = [
  '1632610992723-82d7c212f6d7', '1741893043659-ca8b82a8b637', '1732649124686-3bab54f79aa3',
  '1738898179451-b5fc497f9f8e', '1509316554658-04f9287cdb78', '1721176487015-5408ae0e9bc2',
];

/** Picks `count` photos starting at `start`, wrapping around the pool. */
const pick = (pool: string[], start: number, count: number) =>
  Array.from({ length: count }, (_, i) => photo(pool[(start + i) % pool.length]));

interface Demo {
  name: string;
  slug: string;
  area: string;
  shortDescription: string;
  about: string;
  services: string[];
  quickInfo: QuickInfoItem[];
  isFeatured?: boolean;
  photos: string[];
}

/** "Sector 18, Noida" → locality Sector 18 in the area Noida (one of LISTING_AREAS). */
const place = (text: string) => {
  const [locality, area] = text.includes(', ') ? text.split(', ') : [null, text];
  return { area: area!, locality };
};

const qi = (...pairs: [string, string][]): QuickInfoItem[] => pairs.map(([label, value]) => ({ label, value }));

const VENUE_SERVICES = [
  'In-house catering', 'Decor and stage setup', 'Bridal changing room', 'Air-conditioned hall',
  'Valet parking', 'Power backup', 'DJ and sound system', 'Outside decorators allowed',
];

const venue = (
  i: number,
  name: string,
  slug: string,
  area: string,
  type: string,
  veg: string,
  nonVeg: string,
  capacity: string,
  rooms: string,
  parking: string,
  intro: string,
  isFeatured = false,
): Demo => ({
  name,
  slug,
  area,
  isFeatured,
  shortDescription: `${type} in ${area.split(',')[0]} for weddings, receptions and sangeet.`,
  about: `${intro}\n\nThe team handles everything from the mandap and stage decor to the menu, so families can focus on the celebration. Packages are available for roka, engagement, sangeet, wedding and reception functions.`,
  services: VENUE_SERVICES.slice(i % 3, (i % 3) + 6),
  quickInfo: qi(
    ['Veg', `${veg} per plate`],
    ['Non veg', `${nonVeg} per plate`],
    ['Capacity', capacity],
    ['Rooms', rooms],
    ['Venue type', type],
    ['Parking', parking],
  ),
  // Venues 4-7 start two photos later so every cover is different.
  photos: pick(VENUE_PHOTOS, i * 5 + Math.floor(i / 4) * 2, 5),
});

const DEMO: Record<string, Demo[]> = {
  'wedding-venues': [
    venue(0, 'The Grand Imperial Banquet', 'the-grand-imperial-banquet-sector-18', 'Sector 18, Noida', 'Banquet Hall', '₹1,200', '₹1,450', '100–600 guests', '12 rooms', '150 cars', 'A landmark banquet in the heart of Sector 18, known for its crystal chandeliers, double-height ceilings and a 40-foot stage that suits grand pheras and receptions alike.', true),
    venue(1, 'Royal Orchid Lawns', 'royal-orchid-lawns-sector-135', 'Sector 135, Noida', 'Lawn & Banquet', '₹1,500', '₹1,800', '200–1,500 guests', '6 rooms', '300 cars', 'Two landscaped lawns and an indoor banquet on the Noida Expressway, ideal for evening receptions under the stars with a covered fallback for winter weddings.'),
    venue(2, 'Shubh Vivah Mahal', 'shubh-vivah-mahal-sector-63', 'Sector 63, Noida', 'Banquet Hall', '₹900', '₹1,100', '100–500 guests', '4 rooms', '80 cars', 'A family-run marriage hall with traditional decor, a separate mehendi area and easy access from NH-24, popular for value-for-money weddings.'),
    venue(3, 'Crystal Palace Banquet', 'crystal-palace-banquet-gaur-city', 'Gaur City, Greater Noida West', 'Banquet Hall', '₹1,100', '₹1,350', '150–800 guests', '10 rooms', '120 cars', 'A modern pillarless hall in Gaur City with LED walls, a mirrored entrance and an in-house decor team for themed weddings.', true),
    venue(4, 'Sapphire Courtyard', 'sapphire-courtyard-sector-104', 'Sector 104, Noida', 'Boutique Venue', '₹1,800', '₹2,100', '50–300 guests', '8 rooms', '60 cars', 'An intimate courtyard venue for smaller weddings and cocktail evenings, with a heritage-style facade and fairy-lit open-air seating.'),
    venue(5, 'Aangan Farmhouse', 'aangan-farmhouse-noida-extension', 'Greater Noida West', 'Farmhouse', '₹1,300', '₹1,600', '200–1,000 guests', '5 rooms', '200 cars', 'A green farmhouse with a sprawling lawn, poolside area and cottages for the wedding party, perfect for day weddings and haldi ceremonies.'),
    venue(6, 'Ivory Pearl Convention Centre', 'ivory-pearl-convention-centre-knowledge-park', 'Knowledge Park, Greater Noida', 'Convention Centre', '₹1,000', '₹1,250', '300–2,000 guests', '20 rooms', '400 cars', 'One of the largest convention spaces in Greater Noida, with three halls that can run sangeet, wedding and reception side by side.'),
    venue(7, 'The Golden Mandap', 'the-golden-mandap-sector-50', 'Sector 50, Noida', 'Banquet Hall', '₹1,400', '₹1,700', '100–400 guests', '6 rooms', '90 cars', 'A warm, gold-toned banquet with a permanent mandap setup and a terrace for pre-wedding functions, a short drive from Sector 50 metro.'),
  ],
  'makeup-beauty': [
    { name: 'Glam Studio by Ritika', slug: 'glam-studio-by-ritika-sector-18', area: 'Sector 18, Noida', isFeatured: true, shortDescription: 'Bridal makeup artist known for HD and airbrush looks.', about: 'Ritika and her team have styled over 500 brides across Delhi NCR, specialising in long-wear HD and airbrush makeup that stays fresh from pheras to the reception.\n\nTrials are available at the Sector 18 studio, and the team travels to venues across Noida and Greater Noida.', services: ['Bridal HD makeup', 'Airbrush makeup', 'Hairstyling', 'Saree and dupatta draping', 'Engagement and party makeup', 'Pre-bridal trial'], quickInfo: qi(['Bridal makeup', '₹25,000 onwards'], ['Party makeup', '₹5,000 onwards'], ['Experience', '9 years'], ['Travels to venue', 'Yes']), photos: pick(MAKEUP_PHOTOS, 0, 3) },
    { name: 'Kohl & Kumkum Bridal Studio', slug: 'kohl-kumkum-bridal-studio-sector-62', area: 'Sector 62, Noida', shortDescription: 'Traditional and contemporary bridal looks with mehendi.', about: 'A bridal studio that pairs classic red-bride looks with modern minimal styles, with an in-house mehendi artist for the whole family.\n\nPackages cover the bride, the mother of the bride and bridesmaids.', services: ['Bridal makeup', 'Mehendi for bride and family', 'Hairstyling', 'Nail art', 'Family makeup packages'], quickInfo: qi(['Bridal makeup', '₹18,000 onwards'], ['Party makeup', '₹4,000 onwards'], ['Experience', '6 years'], ['Travels to venue', 'Yes']), photos: pick(MAKEUP_PHOTOS, 3, 3) },
    { name: 'Blush Beauty Lounge', slug: 'blush-beauty-lounge-greater-noida-west', area: 'Greater Noida West', shortDescription: 'Salon and bridal lounge with pre-bridal packages.', about: 'A full-service salon with a dedicated bridal lounge, offering pre-bridal skin and hair care as well as wedding-day makeup.\n\nPopular for its one-month pre-bridal packages.', services: ['Bridal makeup', 'Pre-bridal skin care', 'Hair spa and smoothening', 'Groom grooming', 'Party makeup'], quickInfo: qi(['Bridal makeup', '₹15,000 onwards'], ['Pre-bridal package', '₹12,000'], ['Experience', '5 years'], ['Travels to venue', 'On request']), photos: pick(MAKEUP_PHOTOS, 6, 3) },
  ],
  'catering-halwai': [
    { name: 'Annapurna Caterers', slug: 'annapurna-caterers-sector-27', area: 'Sector 27, Noida', isFeatured: true, shortDescription: 'Pure-veg wedding catering with live counters.', about: 'Annapurna has catered North Indian weddings in Noida for two decades, known for its live chaat, tandoor and jalebi counters.\n\nMenus are customised after a free tasting session.', services: ['Pure-veg menus', 'Live chaat and tandoor counters', 'Mithai and dessert counters', 'Service staff', 'Crockery and buffet setup'], quickInfo: qi(['Veg', '₹650 per plate'], ['Minimum order', '100 plates'], ['Cuisines', 'North Indian, Chinese'], ['Tasting', 'Free']), photos: pick(CATERING_PHOTOS, 0, 3) },
    { name: 'Shahi Rasoi Halwai', slug: 'shahi-rasoi-halwai-sector-22', area: 'Sector 22, Noida', shortDescription: 'Traditional halwai for weddings and family functions.', about: 'A traditional halwai famous for fresh mithai, kachori-sabzi breakfasts and complete wedding feasts cooked on site.\n\nThey also take bulk mithai orders for shagun and gifting.', services: ['Wedding feasts', 'Fresh mithai', 'Breakfast and snacks', 'Bulk sweet orders', 'On-site cooking'], quickInfo: qi(['Veg', '₹550 per plate'], ['Minimum order', '50 plates'], ['Cuisines', 'North Indian, Rajasthani'], ['Tasting', 'On request']), photos: pick(CATERING_PHOTOS, 3, 3) },
    { name: 'Spice Route Catering Co.', slug: 'spice-route-catering-greater-noida', area: 'Alpha 1, Greater Noida', shortDescription: 'Multi-cuisine veg and non-veg catering.', about: 'A multi-cuisine caterer offering Mughlai, Continental and Indo-Chinese menus, with separate veg and non-veg kitchens.\n\nThey handle weddings from 100 to 2,000 guests.', services: ['Veg and non-veg menus', 'Mughlai and Continental', 'Live grills', 'Bar and mocktail counter', 'Service staff'], quickInfo: qi(['Veg', '₹750 per plate'], ['Non veg', '₹950 per plate'], ['Minimum order', '100 plates'], ['Cuisines', 'Mughlai, Continental']), photos: pick(CATERING_PHOTOS, 6, 3) },
  ],
  'photography-films': [
    { name: 'Moments by Arjun Studio', slug: 'moments-by-arjun-studio-sector-76', area: 'Sector 76, Noida', isFeatured: true, shortDescription: 'Candid wedding photography and cinematic films.', about: 'Arjun and his team shoot candid, story-led wedding photography and cinematic films, with drone coverage for outdoor functions.\n\nEvery package includes a pre-wedding consultation and a printed album.', services: ['Candid photography', 'Traditional photography', 'Cinematic wedding film', 'Pre-wedding shoot', 'Drone coverage', 'Printed albums'], quickInfo: qi(['Photo package', '₹75,000 onwards'], ['Photo + video', '₹1,40,000 onwards'], ['Delivery', '4–6 weeks'], ['Experience', '10 years']), photos: pick(PHOTOGRAPHY_PHOTOS, 0, 3) },
    { name: 'Pixel Pheras Films', slug: 'pixel-pheras-films-sector-15', area: 'Sector 15, Noida', shortDescription: 'Wedding films, teasers and reels.', about: 'A young filmmaking team known for short wedding teasers and Instagram reels delivered within a week, alongside the full film.\n\nThey work with a small crew to keep the coverage unobtrusive.', services: ['Wedding films', 'Teasers and reels', 'Candid photography', 'Same-day edits'], quickInfo: qi(['Photo package', '₹60,000 onwards'], ['Photo + video', '₹1,10,000 onwards'], ['Delivery', '3–5 weeks'], ['Experience', '5 years']), photos: pick(PHOTOGRAPHY_PHOTOS, 3, 3) },
    { name: 'Candid Vows Photography', slug: 'candid-vows-photography-greater-noida', area: 'Pari Chowk, Greater Noida', shortDescription: 'Natural-light candid and pre-wedding shoots.', about: 'Candid Vows focuses on natural, unposed moments and relaxed pre-wedding shoots at locations around Greater Noida.\n\nAlbums are designed in-house.', services: ['Candid photography', 'Pre-wedding shoot', 'Engagement shoot', 'Album design'], quickInfo: qi(['Photo package', '₹50,000 onwards'], ['Pre-wedding shoot', '₹25,000'], ['Delivery', '4 weeks'], ['Experience', '7 years']), photos: pick(PHOTOGRAPHY_PHOTOS, 6, 3) },
  ],
  'cards-invitations': [
    { name: 'Paper Petals Invitations', slug: 'paper-petals-invitations-sector-18', area: 'Sector 18, Noida', shortDescription: 'Designer wedding cards and invitation boxes.', about: 'Paper Petals designs premium wedding cards, laser-cut invitations and invitation boxes with sweets or dry fruits.\n\nDesigns are customised with the couple’s monogram.', services: ['Designer wedding cards', 'Laser-cut invitations', 'Invitation boxes', 'Monogram design', 'Envelope printing'], quickInfo: qi(['Printed cards', '₹80 per card'], ['Invitation boxes', '₹450 per box'], ['Minimum order', '100 cards'], ['Delivery', '7–10 days']), photos: pick(INVITATION_PHOTOS, 0, 3) },
    { name: 'Shagun Cards', slug: 'shagun-cards-sector-2', area: 'Sector 2, Noida', isFeatured: true, shortDescription: 'Traditional wedding cards and shagun envelopes.', about: 'A long-standing card shop with hundreds of ready designs in Hindi and English, plus shagun envelopes and ritual stationery.\n\nQuick turnaround for last-minute orders.', services: ['Traditional wedding cards', 'Hindi and English printing', 'Shagun envelopes', 'Express printing'], quickInfo: qi(['Printed cards', '₹35 per card'], ['Minimum order', '50 cards'], ['Delivery', '3–5 days'], ['Languages', 'Hindi, English']), photos: pick(INVITATION_PHOTOS, 3, 3) },
    { name: 'Royal Scrolls Studio', slug: 'royal-scrolls-studio-noida-extension', area: 'Greater Noida West', shortDescription: 'E-invites, video invitations and scroll cards.', about: 'Royal Scrolls makes animated e-invites, video invitations and handmade scroll cards for couples who want something different.\n\nE-invites are delivered as WhatsApp-ready videos and PDFs.', services: ['Video invitations', 'E-invites', 'Scroll cards', 'Save the dates', 'Caricature invites'], quickInfo: qi(['E-invites', '₹3,000 onwards'], ['Scroll cards', '₹150 per card'], ['Delivery', '2–7 days'], ['Formats', 'Video, PDF, print']), photos: pick(INVITATION_PHOTOS, 1, 4) },
  ],
};

const video = (id: string): ListingVideo => ({ kind: 'video', url: `https://www.youtube.com/watch?v=${id}` });
const short = (id: string): ListingVideo => ({ kind: 'short', url: `https://www.youtube.com/shorts/${id}` });

/** Videos per demo vendor, by slug. Some have videos and Shorts, some only one kind, some none. */
const DEMO_VIDEOS: Record<string, ListingVideo[]> = {
  // Wedding venues: venue tours, plus mandap and stage decor Shorts.
  'the-grand-imperial-banquet-sector-18': [video('5HxYhLOrtyU'), video('MaTM5vKLMfE'), short('g4QXtE46CYk'), short('slpeF129D6c'), short('6cPVtlLGWAU')],
  'royal-orchid-lawns-sector-135': [video('EP_QpHvK4I0'), short('6cPVtlLGWAU')],
  'shubh-vivah-mahal-sector-63': [video('4TAJ_1oc8P0')],
  'crystal-palace-banquet-gaur-city': [video('voV3MXKTICY'), short('slpeF129D6c'), short('g4QXtE46CYk')],
  'sapphire-courtyard-sector-104': [short('g4QXtE46CYk'), short('6cPVtlLGWAU'), short('slpeF129D6c')],
  'aangan-farmhouse-noida-extension': [video('EP_QpHvK4I0')],
  'ivory-pearl-convention-centre-knowledge-park': [video('5HxYhLOrtyU')],
  // The Golden Mandap has none, to check the page without a Videos section.
  // Makeup: bridal look Shorts and a tutorial.
  'glam-studio-by-ritika-sector-18': [video('EtqLMR_BGQY'), short('yAlQjURD5Zw'), short('cRniI6QoW0w'), short('QwsTNBUv0Xw'), short('QJWqhbhw-zs')],
  'kohl-kumkum-bridal-studio-sector-62': [short('QwsTNBUv0Xw'), short('cRniI6QoW0w')],
  'blush-beauty-lounge-greater-noida-west': [video('EtqLMR_BGQY'), short('QJWqhbhw-zs')],
  // Catering: buffet and live counter clips.
  'annapurna-caterers-sector-27': [video('A8RmNea8DIg'), short('glyflalG46I'), short('r8sQpFsJj4c')],
  'shahi-rasoi-halwai-sector-22': [short('r8sQpFsJj4c')],
  'spice-route-catering-greater-noida': [video('LDqaG-yHwNU'), short('glyflalG46I')],
  // Photography: wedding highlight films.
  'moments-by-arjun-studio-sector-76': [video('9g063Rk_KHg'), video('dqnNbhp51Oo'), video('2LRSndl342k')],
  'pixel-pheras-films-sector-15': [video('2LRSndl342k'), video('dqnNbhp51Oo')],
  'candid-vows-photography-greater-noida': [video('9g063Rk_KHg')],
  // Cards: invitation printing and design clips.
  'paper-petals-invitations-sector-18': [video('30eHROxQ-fA'), short('Ph7U_gjcKwE')],
  'shagun-cards-sector-2': [short('qoG8eyMqqH0')],
  'royal-scrolls-studio-noida-extension': [short('P0SZGvW-An4'), short('qoG8eyMqqH0')],
};

/** Photo hero banners, shown before the seeded text-only banners. */
const DEMO_BANNERS = [
  {
    imageUrl: photo(VENUE_PHOTOS[0]),
    heading: 'Wedding venues in Noida',
    subheading: 'Banquets, lawns and farmhouses for every guest count',
    ctaLabel: 'View venues',
    ctaLink: '/wedding/wedding-venues',
  },
  {
    imageUrl: photo(MAKEUP_PHOTOS[0]),
    heading: 'Bridal makeup that lasts all night',
    subheading: 'HD and airbrush artists across Noida and Greater Noida',
    ctaLabel: 'Find artists',
    ctaLink: '/wedding/makeup-beauty',
  },
  {
    imageUrl: photo(PHOTOGRAPHY_PHOTOS[2]),
    heading: 'Capture every moment',
    subheading: 'Candid photographers and cinematic wedding films',
    ctaLabel: 'See photographers',
    ctaLink: '/wedding/photography-films',
  },
];
const DEMO_BANNER_URLS = DEMO_BANNERS.map((b) => b.imageUrl);

const DEMO_PROJECTS = demoProjects().map(projectValues);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

try {
  if (process.argv.includes('--remove')) {
    const removed = await db
      .delete(listings)
      .where(like(listings.email, `%${DEMO_EMAIL_DOMAIN}`))
      .returning({ id: listings.id });
    console.log(`Removed ${removed.length} demo listings`);
    const removedBanners = await db
      .delete(banners)
      .where(inArray(banners.imageUrl, DEMO_BANNER_URLS))
      .returning({ id: banners.id });
    console.log(`Removed ${removedBanners.length} demo banners`);
    // A demo project is removed only while its slug and RERA ID are both still the demo's.
    const removedProjects = await db
      .delete(projects)
      .where(or(...DEMO_PROJECTS.map((p) => and(eq(projects.slug, p.slug), eq(projects.reraId, p.reraId)))))
      .returning({ id: projects.id });
    console.log(`Removed ${removedProjects.length} demo projects`);
  } else {
    const cats = await db
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(inArray(categories.slug, Object.keys(DEMO)));
    let added = 0;
    let videosUpdated = 0;
    for (const { id: categoryId, slug: categorySlug } of cats) {
      for (const { photos, ...demo } of DEMO[categorySlug]) {
        const [cover, ...gallery] = photos;
        const email = `${demo.slug}${DEMO_EMAIL_DOMAIN}`;
        const videos = DEMO_VIDEOS[demo.slug] ?? [];
        const [row] = await db
          .insert(listings)
          .values({
            ...demo,
            ...place(demo.area),
            categoryId,
            coverImageUrl: cover,
            videos,
            email,
            phone: '98100 00000',
          })
          .onConflictDoNothing({ target: listings.slug })
          .returning({ id: listings.id });
        if (!row) {
          // Already seeded: bring its videos up to date, and only if it is still the demo vendor.
          const updated = await db
            .update(listings)
            .set({ videos })
            .where(and(eq(listings.slug, demo.slug), eq(listings.email, email)))
            .returning({ id: listings.id });
          videosUpdated += updated.length;
          continue;
        }
        await db
          .insert(listingImages)
          .values(gallery.map((url, sortOrder) => ({ listingId: row.id, url, sortOrder })));
        added++;
      }
    }
    console.log(`Demo listings added: ${added}; existing demo listings given videos: ${videosUpdated}`);

    const existing = await db
      .select({ imageUrl: banners.imageUrl })
      .from(banners)
      .where(inArray(banners.imageUrl, DEMO_BANNER_URLS));
    const missing = DEMO_BANNERS.filter((b) => !existing.some((e) => e.imageUrl === b.imageUrl));
    if (missing.length) {
      // Sort ahead of every existing banner so the photo slides come first.
      const [{ first }] = await db.select({ first: min(banners.sortOrder) }).from(banners);
      const start = (first ?? 0) - missing.length;
      await db.insert(banners).values(missing.map((b, i) => ({ ...b, sortOrder: start + i })));
    }
    console.log(`Demo banners added: ${missing.length}`);

    const addedProjects = await db.insert(projects).values(DEMO_PROJECTS).onConflictDoNothing({ target: projects.slug }).returning({ id: projects.id });
    console.log(`Demo projects added: ${addedProjects.length}`);
  }
} finally {
  await pool.end();
}
