import type { HOME_CARD_ICONS } from "@nsb/shared";

type HomeCardIcon = (typeof HOME_CARD_ICONS)[number];

/** Static content of the home page, copied from "NSB Live Demo.html". */

const IMG = "/images/nsb-home";

/** Icon paths (24×24, stroked) used across the home page. */
export const ICON = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  pin: "M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  bag: "M6 8h12l1 12H5zM9 8a3 3 0 0 1 6 0",
  tag: "M3 12V4h8l10 10-8 8zM8 8h.01",
  shield: "M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6zM9 12l2 2 4-4",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-5 1-9z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  star: "M12 3l2.600 5.600 6.100.7-4.500 4.200 1.200 6L12 16.500 6.600 19.500l1.200-6L3.300 9.300l6.100-.7z",
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19h.01M17 19h.01",
  cart: "M3 4h2l2.500 11h11l2-8H6M9 20h.01M17 20h.01",
  gem: "M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l-2 5 5 11 5-11-2-5",
  store:
    "M4 9l1.500-5h13L20 9M4 9v11h16V9M4 9a3 3 0 0 0 5.300 1.800M9.300 10.800a3 3 0 0 0 5.400 0M14.700 10.800A3 3 0 0 0 20 9M10 20v-5h4v5",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  home: "M4 11l8-7 8 7v9H4zM10 20v-6h4v6",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.500-7 10-7 10z",
  chat: "M4 5h16v11H9l-5 4z",
  phone: "M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  building: "M4 21V8l8-5 8 5v13M9 21v-6h6v6",
  sparkle:
    "M12 3l1.8 5.2L19 10l-5.200 1.800L12 17l-1.800-5.200L5 10l5.200-1.800zM19 17l.7 1.800 1.800.7-1.800.7L19 22l-.7-1.800-1.800-.7 1.800-.7z",
  camera: "M4 8h4l2-3h4l2 3h4v11H4zM12 17a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7z",
  fork: "M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 4-3 7h3v11",
  facebook: "M14 8h2V5h-2.400C11.400 5 10 6.400 10 8.600V10H8v3h2v7h3v-7h2.200l.4-3H13V8.800c0-.5.2-.8 1-.8z",
  instagram: "M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zM12 15.500a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7zM17 7.200v.01",
  linkedin: "M6 9v9M6 6v.01M10 18V9M10 13a3 3 0 0 1 6 0v5",
  x: "M20 6.500c-.6.3-1.200.4-1.900.5.7-.4 1.200-1 1.400-1.800-.6.4-1.300.6-2.100.8a3.300 3.300 0 0 0-5.600 3c-2.700-.1-5.100-1.400-6.700-3.400-.9 1.500-.4 3.400 1 4.400-.5 0-1-.2-1.500-.4 0 1.600 1.100 3 2.600 3.300-.5.100-1 .2-1.500.1.4 1.300 1.700 2.300 3.100 2.300A6.600 6.600 0 0 1 4 17.300 9.300 9.300 0 0 0 9 18.800c6 0 9.400-5 9.200-9.500.600-.5 1.200-1 1.800-1.800z",
  youtube: "M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM10 9.500v5l4.500-2.500z",
} as const;

export const LOGO = `${IMG}/logo.png`;

/** Hero slides shown when no banner is active in Admin › Banners. */
export const HERO_FALLBACK = [
  { cls: "s1", tag: "Wedding season", heading: "Plan your dream wedding", text: "Venues, makeup, catering and more in Noida", cta: "Explore", link: "/wedding" },
  {
    cls: "s4",
    tag: "Real estate",
    heading: "Find your dream home in Noida",
    text: "Builder projects across Noida, Greater Noida and Gr. Noida West.",
    cta: "Explore",
    link: "/real-estate",
  },
  { cls: "s2", tag: "Featured partner", heading: "Your brand, on Noida's front page", text: "Premium banner slot for local businesses.", cta: "Advertise with NSB", link: "#" },
  { cls: "s3", tag: "NSB Johri Bazaar", heading: "Noida's jewellers, one premium bazaar", text: "Gold, diamond, bridal and silver, together.", cta: "Explore", link: "#johri" },
];

/** The four photo tiles beside the hero. */
/** Drawings for the home cards' icons (HOME_CARD_ICONS); the cards themselves are set in Admin › Home page. */
export const HOME_CARD_ICON_PATHS: Record<HomeCardIcon, string> = {
  venue: ICON.building,
  makeup: ICON.sparkle,
  camera: ICON.camera,
  catering: ICON.fork,
  wedding: ICON.heart,
  interior: "M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM6 18v2M18 18v2",
  "brand-store": "M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2",
  school: "M2 9l10-5 10 5-10 5zM6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5",
  "real-estate": "M6.5 3h11A1.5 1.5 0 0 1 19 4.5v16.5H5V4.5A1.5 1.5 0 0 1 6.5 3zM9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3",
  loan: "M6 4h12M6 9h12M9 4c6 0 6 8 0 8l7 8",
  premium: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  "new-launch": "M3 9h18v12H3zM12 9v12M3 13h18M12 9c-3 0-4-4-1.5-4 2 0 1.5 4 1.5 4zm0 0c3 0 4-4 1.5-4-2 0-1.5 4-1.5 4z",
  services: "M14 6a4 4 0 0 0-5 5L3 17l4 4 6-6a4 4 0 0 0 5-5l-3 3-3-1-1-3z",
  hotel: "M3 18V8M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6M7 11h.01",
};

export const TRUST = [
  { icon: ICON.tag, title: "Top Deals", text: "Up to 60% off on services" },
  { icon: ICON.shield, title: "NSB Verified", text: "Trusted partner services" },
  { icon: ICON.flame, title: "Trending", text: "Limited time offers" },
];

/** "Browse by category": live categories link to their page, the rest show a "Soon" tag. */
/**
 * How each top-level category looks in "Browse by category", by slug. The list and its order
 * come from Admin › Home page › Browse by category; a category missing here gets DEFAULT_LOOK.
 * `live` categories link to their page; the rest show "Soon".
 */
export interface CategoryLook {
  sub?: string;
  icon: string;
  live?: boolean;
  wedding?: boolean;
}
export const CATEGORY_LOOK: Record<string, CategoryLook> = {
  wedding: { sub: "Venues, makeup & more", icon: ICON.heart, live: true, wedding: true },
  "real-estate": { sub: "Builders & projects", icon: ICON.building, live: true },
  "tattoo-studios": { icon: "M4 20l1-4L16 5l3 3L8 19zM13 8l3 3" },
  restaurants: { icon: ICON.fork },
  "loans-finance": { icon: "M7 5h10M7 9h10M8 5c5 0 6 5 0 5l7 9" },
  "interior-services": { icon: "M3 12a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM5 12V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3M6 17v2M18 17v2" },
  "beauty-spa": { icon: ICON.sparkle },
  "home-decor": { icon: "M9 3h6l3 9H6zM12 12v8M8 21h8" },
  "travel-services": { icon: "M3 13l18-8-6 15-3-6zM12 14l4-4" },
  "fitness-gym": { icon: "M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" },
  electronics: { icon: "M13 2L5 14h6l-1 8 8-12h-6z" },
  "ac-repair": { icon: "M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" },
  "refurbished-laptops": { icon: "M5 6h14v9H5zM3 18h18" },
  cafes: { icon: "M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 9h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2" },
  "event-services": { icon: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" },
};
export const DEFAULT_LOOK: CategoryLook = { icon: ICON.grid };
/** The design's last card, after the admin's categories. */
export const MORE_CATEGORIES = { name: "9 more", sub: "Opening soon", icon: "M5 12h.01M12 12h.01M19 12h.01" };

export const MARKETS = [
  { name: "Sector 18", g: "g1" },
  { name: "Jagat Farm", g: "g2" },
  { name: "Gaur City", g: "g3" },
  { name: "Brahmaputra", g: "g4" },
  { name: "Pari Chowk", g: "g5" },
  { name: "Indirapuram", g: "g6" },
  { name: "Atta Market", g: "g1" },
  { name: "Noida Extension", g: "g2" },
];

export const HIGHLIGHTS = [
  { title: "NSB Spotlight", g: "g1" },
  { title: "Hot Deals Near You", g: "g2" },
  { title: "Recommended", g: "g3" },
  { title: "Trending in Noida", g: "g6" },
];

export const PICKS = [
  { name: "Luxury Salon & Spa", area: "Sector 16, Noida", category: "Beauty & Wellness", style: { backgroundImage: `url(${IMG}/pick-1.jpg)` } },
  { name: "Cool AC Service", area: "Sector 16, Noida", category: "AC Repair", style: { backgroundImage: `url(${IMG}/pick-2.jpg)`, backgroundPosition: "center 40%" } },
  {
    name: "ABC Realtech",
    area: "Sector 16, Noida",
    category: "Real Estate",
    style: { backgroundImage: `url(${IMG}/pick-3.jpg)`, backgroundColor: "#fff", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" },
  },
  { name: "Finwing loans", area: "Sector 2, Noida", category: "Loans & Finance", style: { backgroundImage: `url(${IMG}/pick-4.jpg)`, backgroundPosition: "center 24%" } },
];

export const BRANDS = ["Rosier", "JhaJi", "Rajdhani", "Bellavita"].map((name, i) => ({ name, logo: `${IMG}/brand-${i + 1}.png` }));

export const PRODUCTS = [
  { brand: "Rosier · 250 ml", name: "A2 Gir Cow Bilona Ghee", price: "₹699", mrp: "₹799", off: "13% off" },
  { brand: "JhaJi · Pickle", name: "Sookha Bharua Mango Pickle", price: "₹349", mrp: "₹399", off: "13% off" },
  { brand: "Rajdhani · 5 kg", name: "Chakki Atta – Full Fibre Wheat Flour", price: "₹289", mrp: "₹320", off: "10% off" },
  { brand: "Bellavita · 100 ml", name: "CEO Man Eau de Parfum", price: "₹999", mrp: "₹1,499", off: "33% off" },
].map((p, i) => ({ ...p, image: `${IMG}/product-${i + 1}.jpg` }));

export const HOW_IT_WORKS = [
  { title: "Pick a brand", text: "Visit the brand's store page" },
  { title: "Add to cart", text: "Choose products and checkout" },
  { title: "Same-day delivery", text: "Delivered inside Noida" },
];

export const JOHRI = [
  { title: "Gold", text: "Everyday to heirloom" },
  { title: "Diamond", text: "Certified pieces" },
  { title: "Bridal", text: "Wedding sets" },
  { title: "Silver", text: "Gifts and festive" },
];

export const DEALS = [
  { name: "Lakme Salon", text: "All services", area: "Sector 16, Noida", position: "center 38%" },
  { name: "AC Gas Refilling", text: "Starting @ ₹599", area: "Sector 62, Noida", position: "center 40%" },
  { name: "Home Interior", text: "On Modular kitchen", area: "Sector 93, Noida", position: undefined },
  { name: "Home Loans", text: "Low interest rate", area: "All over Noida", position: "48% center" },
].map((d, i) => ({ ...d, image: `${IMG}/deal-${i + 1}.jpg` }));

export const FAQS = [
  {
    q: "What is Noida Super Bazaar?",
    a: "Noida Super Bazaar is a hyperlocal discovery platform for Noida. It connects you with trusted local businesses and services in one place.",
  },
  { q: "Which areas do you cover?", a: "We cover Noida, Greater Noida and Greater Noida West. You can switch your area from the location menu at the top." },
  {
    q: "Which categories are live?",
    a: 'Wedding and Real Estate are live now. More categories will open one by one, so you will see a "Soon" tag on the rest.',
  },
  { q: "What does NSB Verified mean?", a: "NSB Verified marks partner businesses that we have onboarded and stand behind. It helps you pick with more confidence." },
  {
    q: "How can I list my business?",
    a: "Open Partner with us and get in touch. Listings are limited in each category and area, so every business gets proper visibility.",
  },
  { q: "How do I reach the NSB team?", a: "Use the Contact us link in the footer, or message us on WhatsApp from the bottom bar on your phone." },
];
