import type { ProjectConfiguration, ProjectInput, ProjectType } from '@nsb/shared';

/**
 * The 16 demo projects of the NSB Live Demo and four more, for design review. Not real projects. Photos are the
 * demo's renders in apps/web/public/images/real-estate; the walkthrough video is a public YouTube
 * video by another creator that allows embedding, there only to show the Videos section.
 * The seed removes a demo project only when both its slug and its RERA ID still match.
 */

const img = (n: number) => `/images/real-estate/project-${n}.jpg`;
const PLAN_3D = '/images/real-estate/floor-plan-3d.jpg';
const WALKTHROUGH = 'https://www.youtube.com/watch?v=5HxYhLOrtyU';
const DAY = 86_400_000;

const HIGHLIGHTS = [
  'Mivan aluminium formwork technology',
  'Double-height entrance lobby',
  'Quick access to Noida–Greater Noida Expressway',
  '4-acre central green court',
  'Just 2.8 km from the metro station',
  'Exclusive clubhouse with gym',
  'Fragrance and pet gardens',
  'Premium marble and modular kitchen',
];
const AMENITIES = [
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Kids Play Area', 'Jogging Track', '24x7 Security',
  'CCTV Surveillance', 'Power Backup', 'Landscaped Gardens', 'Indoor Games', 'Yoga Deck', 'Mini Theatre',
];
const BROKERS = ['Prime Estates', 'Delhi NCR Properties', 'Sharma Realty', 'Metro Homes', 'Urban Brokers', 'Noida Property Hub'];

type Row = [name: string, builder: string, area: ProjectInput['area'], locality: string, crore: number, type: ProjectType, premium: boolean, possession: ProjectInput['possessionStatus'], possessionDate: string, tags: string[]];

const ROWS: Row[] = [
  ['Skyline Heights', 'Aarav Realty', 'Noida', 'Sector 150', 1.25, 'apartments', true, 'Under Construction', 'Dec 2028', ['Expressway', 'Gated Society', 'Investment']],
  ['Green Arcade Residency', 'Kapoor Group', 'Noida', 'Sector 137', 0.85, 'apartments', false, 'Ready to Move', 'Immediate', ['Near Metro', 'Affordable']],
  ['The Palm Court', 'Sharma Developers', 'Noida', 'Expressway', 2.4, 'apartments', true, 'Under Construction', 'Jun 2029', ['Luxury', 'Expressway']],
  ['Ivory Towers', 'Mehra Infra', 'Noida', 'Sector 128', 1.9, 'apartments', false, 'Ready to Move', 'Immediate', ['Luxury', 'Golf View']],
  ['Orchid Meadows', 'Gupta Builders', 'Noida', 'Sector 143', 0.95, 'apartments', false, 'Under Construction', 'Mar 2028', ['Near Metro', 'Investment']],
  ['Aurum Residences', 'Aarav Realty', 'Noida', 'Sector 107', 1.45, 'apartments', false, 'Under Construction', 'Sep 2028', ['Gated Society']],
  ['Lotus Greens', 'Kapoor Group', 'Noida', 'Sector 78', 0.72, 'apartments', false, 'Ready to Move', 'Immediate', ['Affordable', 'Near Metro']],
  ['Crest Vista', 'Sharma Developers', 'Noida', 'Sector 62', 1.15, 'apartments', false, 'Ready to Move', 'Immediate', ['Near Metro', 'IT Hub']],
  ['Sapphire Bay', 'Mehra Infra', 'Noida', 'Sector 44', 2.1, 'villas', false, 'Under Construction', 'Dec 2029', ['Luxury', 'Gated Society']],
  ['Willow Heights', 'Gupta Builders', 'Noida', 'Sector 119', 0.68, 'apartments', false, 'Under Construction', 'Jun 2028', ['Affordable']],
  ['Regal Gardens', 'Aarav Realty', 'Noida', 'Sector 100', 1.6, 'villas', false, 'Ready to Move', 'Immediate', ['Gated Society', 'Expressway']],
  ['Maple Square', 'Kapoor Group', 'Noida', 'Sector 75', 1.05, 'apartments', false, 'Under Construction', 'Nov 2028', ['Near Metro']],
  ['Urban Nest', 'Mehra Infra', 'Greater Noida', 'Pi Sector', 0.52, 'apartments', false, 'Ready to Move', 'Immediate', ['Affordable', 'Investment']],
  ['Ivory Residences', 'Kapoor Group', 'Greater Noida', 'Omicron', 1.1, 'plots', false, 'Ready to Move', 'Immediate', ['Investment']],
  ['Royal Orchid', 'Gupta Builders', 'Greater Noida West', 'Sector 4', 0.64, 'apartments', false, 'Under Construction', 'Mar 2028', ['Affordable', 'Gated Society']],
  ['Lakeview Towers', 'Aarav Realty', 'Greater Noida West', 'Techzone 4', 0.78, 'apartments', true, 'Under Construction', 'Sep 2028', ['Lake View', 'Investment']],
  ['Golfview Estates', 'Sharma Developers', 'Noida', 'Sector 152', 3.2, 'villas', true, 'Ready to Move', 'Immediate', ['Luxury', 'Golf View', 'Gated Society']],
  ['Metro Square', 'Gupta Builders', 'Greater Noida West', 'Sector 1', 0.58, 'apartments', false, 'Under Construction', 'Dec 2027', ['Near Metro', 'Affordable']],
  ['Lakeshore Plots', 'Kapoor Group', 'Greater Noida', 'Sector Mu', 0.9, 'plots', false, 'Ready to Move', 'Immediate', ['Lake View', 'Investment']],
  ['Elan Skyvue', 'Aarav Realty', 'Noida', 'Sector 94', 4.5, 'apartments', true, 'Under Construction', 'Mar 2030', ['Luxury', 'Expressway', 'Near Metro']],
];

const plan = { plan2dUrl: null, plan3dUrl: null };
const lakh = (n: number) => Math.round(n / 1e5) * 1e5;

function configurations(type: ProjectType, crore: number, i: number): ProjectConfiguration[] {
  const base = crore * 1e7;
  const d = (i % 3) * 40;
  if (type === 'villas') {
    return [
      { title: '3 BHK Villa', superArea: 2400 + d, carpetArea: 1900 + d, price: lakh(base), ...plan },
      { title: '4 BHK Villa', superArea: 3200 + d, carpetArea: 2600 + d, price: lakh(base * 1.35), ...plan },
    ];
  }
  if (type === 'plots') {
    return [
      { title: 'Plot 150 sq yd', superArea: 1350, carpetArea: 1350, price: lakh(base), ...plan },
      { title: 'Plot 200 sq yd', superArea: 1800, carpetArea: 1800, price: lakh(base * 1.3), ...plan },
    ];
  }
  return [
    { title: '2 BHK', superArea: 1050 + d, carpetArea: 780 + d, price: lakh(base), ...plan },
    { title: '3 BHK', superArea: 1450 + d, carpetArea: 1080 + d, price: lakh(base * 1.36), ...plan },
    { title: '3 BHK+', superArea: 1800 + d, carpetArea: 1340 + d, price: lakh(base * 1.68), ...plan },
  ];
}

const photosOf = (i: number) =>
  i === 0 ? [1, 2, 3, 4, 5].map(img) : i === 6 ? [] : i % 3 === 0 ? [2, 5, 3].map(img) : i % 3 === 1 ? [4, 1].map(img) : [img(5)];

export function demoProjects(now = Date.now()): ProjectInput[] {
  return ROWS.map(([name, builder, area, locality, crore, type, isPremium, possessionStatus, possessionDate, tags], i) => {
    const broker = i % 3 === 1 ? BROKERS[Math.floor(i / 3) % BROKERS.length] : null;
    const configs = configurations(type, crore, i);
    if (i === 0) configs[1] = { ...configs[1], plan3dUrl: PLAN_3D };
    return {
      type,
      area,
      name,
      builder,
      locality,
      reraId: `UPRERAPRJ${100000 + i * 137}`,
      possessionStatus,
      possessionDate,
      launchDate: ['Jan 2025', 'Mar 2024', 'Aug 2025'][i % 3],
      isPremium,
      isFeatured: false,
      tags,
      units: 300 + i * 40,
      landArea: `${3 + (i % 5) * 1.5} Acres`,
      towers: 2 + (i % 4),
      about:
        `${name} brings premium living to ${locality}, ${area}, one of the city’s best-connected addresses. Thoughtfully planned towers, open lawns and a full-fledged clubhouse give every family space to breathe.\n\n` +
        'Homes are designed with cross ventilation, large balconies and branded fittings, close to schools, hospitals and daily markets.',
      highlights: HIGHLIGHTS,
      configurations: configs,
      amenities: AMENITIES.slice(0, 6 + (i % 7)),
      specifications: {
        flooring: 'Living/Dining: Vitrified tiles\nBedrooms: Laminated wooden\nBalcony: Anti-skid tiles',
        fittings: 'Toilets: CP fittings, EWC\nKitchen: Granite platform, SS sink\nDoors: Flush doors',
        walls: 'Interior: Acrylic emulsion\nExterior: Textured paint\nToilets: Ceramic tiles',
      },
      nearby: [
        { name: 'Kidzee School', type: 'School', minutes: 3, km: 1.1 },
        { name: 'Sarvodaya Hospital', type: 'Hospital', minutes: 6, km: 2.5 },
        { name: 'The Opulent Mall', type: 'Mall', minutes: 8, km: 3.2 },
        { name: 'Sector 148 Metro', type: 'Metro station', minutes: 7, km: 2.8 },
      ],
      advertiser: broker
        ? {
            type: 'broker',
            name: broker,
            firm: `${broker} Pvt Ltd`,
            experienceYears: 6 + (Math.floor(i / 3) % 9),
            reraId: `UPRERAAGT${20000 + Math.floor(i / 3) * 77}`,
            established: null,
            projectsDelivered: null,
            about: `${broker} helps families find the right home in Noida and Greater Noida. This project is listed exclusively with this broker on NSB.`,
          }
        : {
            type: 'builder',
            name: builder,
            firm: '',
            experienceYears: null,
            reraId: '',
            established: 2000 + (i % 15),
            projectsDelivered: 4 + (i % 9),
            about: `${builder} has built residential projects across Noida and Greater Noida with a focus on on-time delivery and quality construction.`,
          },
      faqs: i === 0 ? [{ question: 'Is a home loan available?', answer: 'Yes. All major banks approve home loans for this project.' }] : [],
      photos: photosOf(i),
      videoUrl: i === 0 || i % 2 === 1 ? WALKTHROUGH : null,
      videoChapters:
        i === 0
          ? '0:00 Entrance and elevation\n2:10 Clubhouse and pool\n4:30 Amenities tour\n6:40 Sample flat: living and kitchen\n9:30 Bedrooms and balcony\n11:10 Payment plan and next steps'
          : '',
      videos:
        i === 0
          ? [
              { title: 'Sample flat tour (3 BHK)', url: 'https://www.youtube.com/watch?v=MaTM5vKLMfE', chapters: '' },
              { title: 'Amenities and clubhouse', url: 'https://www.youtube.com/watch?v=4TAJ_1oc8P0', chapters: '0:00 Clubhouse\n1:20 Swimming pool\n2:40 Gym and courts' },
            ]
          : [],
      brochureUrl: i % 2 === 0 ? 'https://example.com/brochure.pdf' : null,
      phone: `9810${String(100000 + ((i * 7919 + 13) % 900000)).slice(-6)}`,
      termStart: new Date(now - i * 9 * DAY).toISOString().slice(0, 10),
      termMonths: 12,
      status: i === 4 ? 'draft' : 'live',
      metaTitle: '',
      metaDescription: '',
    };
  });
}
