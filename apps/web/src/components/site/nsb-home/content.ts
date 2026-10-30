import { HOME_CARD_ICON_PATHS, ICON } from "@/components/shared/home-card-icons";

export { HOME_CARD_ICON_PATHS, ICON };

/** Static content of the home page, copied from "NSB Live Demo.html". */

const IMG = "/images/nsb-home";

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

/** Sample stores and products for the design, not real brands. Photos: Unsplash (Unsplash License). */
export const BRANDS = ["Desi Dairy", "Achar House", "Stone Mill", "Scent Studio"].map((name) => ({
  name,
  initials: name
    .split(" ")
    .map((w) => w[0])
    .join(""),
}));

export const PRODUCTS = [
  { brand: "Desi Dairy · 250 ml", name: "A2 Cow Ghee", price: "₹699", mrp: "₹799", off: "13% off" },
  { brand: "Achar House · 400 g", name: "Homemade Mixed Pickle", price: "₹349", mrp: "₹399", off: "13% off" },
  { brand: "Stone Mill · 5 kg", name: "Whole Wheat Chakki Atta", price: "₹289", mrp: "₹320", off: "10% off" },
  { brand: "Scent Studio · 100 ml", name: "Classic Eau de Parfum", price: "₹999", mrp: "₹1,499", off: "33% off" },
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
