import type { HOME_CARD_ICONS } from "@nsb/shared";

type HomeCardIcon = (typeof HOME_CARD_ICONS)[number];

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
