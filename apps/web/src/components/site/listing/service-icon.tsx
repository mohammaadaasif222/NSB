import { createElement, type ComponentProps } from "react";
import {
  Armchair,
  BedDouble,
  Brush,
  Cake,
  Camera,
  Car,
  Check,
  Clock,
  CookingPot,
  Droplets,
  Fan,
  Flame,
  Flower2,
  Gift,
  Hand,
  Images,
  Lightbulb,
  type LucideIcon,
  Mail,
  Mic,
  Music,
  Palette,
  Plane,
  Printer,
  Projector,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Speaker,
  Tent,
  Trash2,
  Trees,
  TriangleAlert,
  Truck,
  Users,
  Utensils,
  UtensilsCrossed,
  Video,
  Wifi,
  Wine,
  Zap,
} from "lucide-react";

/**
 * Picks an icon for a service or key-info line from the words in it, so the listing page's
 * services read like the ezweddingz facilities list (bed for rooms, cutlery for food, …).
 * First match wins; anything else gets a tick.
 */
const ICONS: [RegExp, LucideIcon][] = [
  [/\b(room|accommodation|stay|suite|lodg)/i, BedDouble],
  [/\b(chair|seating|sofa|furniture)/i, Armchair],
  [/\b(crockery|cutlery|utensil)/i, UtensilsCrossed],
  [/\b(food|catering|cater|dining|menu|veg|buffet|plate|halwai|snack|meal|cuisine)/i, Utensils],
  [/\b(cook|kitchen)/i, CookingPot],
  [/\b(cake|dessert|sweet)/i, Cake],
  [/\b(gas|cylinder|fire|flame|bonfire)/i, Flame],
  [/\b(electric|power|generator|backup)/i, Zap],
  [/\b(light|lighting|led)/i, Lightbulb],
  [/\b(clean|housekeeping|garbage|waste)/i, Trash2],
  [/\b(damage|penalt|charge)/i, TriangleAlert],
  [/\b(ac hall|air.?condition|\bac\b|cooling)/i, Snowflake],
  [/\b(non.?ac|fan|ventilat)/i, Fan],
  [/\b(av |audio|sound|speaker|projector|screen|mic)/i, Speaker],
  [/\b(lawn|garden|green|outdoor|open.?air)/i, Trees],
  [/\b(tent|marquee|pandal|canopy|indoor)/i, Tent],
  [/\b(parking|valet|car)/i, Car],
  [/\b(decor|mandap|flower|floral|stage)/i, Flower2],
  [/\b(staff|hospitality|manager|guest|waiter|attendant|capacity|fits)/i, Users],
  [/\b(security|guard|safe|cctv|insur)/i, ShieldCheck],
  [/\b(alcohol|bar|liquor|drinks?)\b/i, Wine],
  [/\b(dj|music|band|dhol|sangeet)/i, Music],
  [/\b(wifi|wi-fi|internet)/i, Wifi],
  [/\b(water|pool|shower|wash)/i, Droplets],
  [/\b(makeup|make-up|bridal|beauty|hair)/i, Palette],
  [/\b(mehendi|mehndi|henna|nail)/i, Hand],
  [/\b(saree|drap|styling|groom)/i, Brush],
  [/\b(drone|aerial)/i, Plane],
  [/\b(video|film|cinemat|reel|short)/i, Video],
  [/\b(photo|candid|shoot|camera)/i, Camera],
  [/\b(album|print|photobook)/i, Images],
  [/\b(card|invite|invitation|envelope|e-invite)/i, Mail],
  [/\b(printing|press|foil|emboss)/i, Printer],
  [/\b(delivery|courier|shipping|transport)/i, Truck],
  [/\b(gift|hamper|favour|favor|return)/i, Gift],
  [/\b(hour|time|timing|day|overnight|late|early)/i, Clock],
  [/\b(anchor|host|emcee|announce)/i, Mic],
  [/\b(sparkler|fireworks|special|premium|luxury)/i, Sparkles],
  [/\b(projector|presentation)/i, Projector],
];

export function serviceIcon(text: string): LucideIcon {
  return ICONS.find(([re]) => re.test(text))?.[1] ?? Check;
}

/** The icon for `text`, rendered with the usual lucide props (className, strokeWidth, …). */
export function ServiceIcon({ text, ...props }: { text: string } & ComponentProps<LucideIcon>) {
  return createElement(serviceIcon(text), { "aria-hidden": true, ...props });
}
