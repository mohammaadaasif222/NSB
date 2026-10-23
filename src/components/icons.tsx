import type { FC } from 'react';
import type { GameShelfKey, RewardType } from '@/types';

/**
 * The handful of line icons the shell needs, inlined so the bundle does not
 * pull in an icon library for eight glyphs. Outlines follow the Lucide set.
 */

export interface IconProps {
  size?: number;
  className?: string;
  /** Line weight. The lobby rail draws finer than the default. */
  strokeWidth?: number;
}

const Svg: FC<IconProps & { children: React.ReactNode }> = ({
  size = 16,
  className,
  strokeWidth = 2,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const HomeIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

export const GamepadIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="6" x2="10" y1="11" y2="11" />
    <line x1="8" x2="8" y1="9" y2="13" />
    <line x1="15" x2="15.01" y1="12" y2="12" />
    <line x1="18" x2="18.01" y1="10" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </Svg>
);

export const SparklesIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
  </Svg>
);

export const ZapIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

export const StarIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Svg>
);

export const DiceIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M16 8h.01" />
    <path d="M8 8h.01" />
    <path d="M8 16h.01" />
    <path d="M16 16h.01" />
    <path d="M12 12h.01" />
  </Svg>
);

export const UserIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const LogInIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </Svg>
);

export const UserPlusIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </Svg>
);

export const WalletIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </Svg>
);

export const ShieldIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </Svg>
);

export const ChevronIcon: FC<IconProps & { open?: boolean }> = ({ open = true, ...p }) => (
  <Svg
    {...p}
    className={`transition-transform flex-shrink-0 ${open ? '' : '-rotate-90'} ${p.className ?? ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const GiftIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="8" width="18" height="4" rx="1" />
    <path d="M12 8v13" />
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </Svg>
);

export const ClockIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </Svg>
);

export const TicketIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M10 8v.01M10 12v.01M10 16v.01" />
  </Svg>
);

export const CrownIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m2 8 4 3 6-7 6 7 4-3-2 11H4Z" />
    <path d="M4 21h16" />
  </Svg>
);

export const TrophyIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v6a5 5 0 0 1-10 0Z" />
    <path d="M17 5h3a2 2 0 0 1-2 4h-1" />
    <path d="M7 5H4a2 2 0 0 0 2 4h1" />
  </Svg>
);

export const ActivityIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Svg>
);

export const MenuIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Svg>
);

export const GlobeIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
  </Svg>
);

export const BellIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 6-3 7-3 7h18s-3-1-3-7" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);

export const ChatIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.8L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z" />
  </Svg>
);

export const CoinIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5a3 3 0 0 0-2.5-1.2c-1.4 0-2.3.8-2.3 1.8s.8 1.5 2.4 1.8 2.5.8 2.5 1.9-1 1.9-2.4 1.9a3 3 0 0 1-2.6-1.3" />
    <path d="M12 7v10" />
  </Svg>
);

export const ChevronDownIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const MailIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </Svg>
);

export const PhoneIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Svg>
);

export const CheckIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
);

export const PencilIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </Svg>
);

/** The avatar's "change picture" affordance. */
export const CameraIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
    <circle cx="12" cy="13" r="3.2" />
  </Svg>
);

/* --- The account rail's set ------------------------------------------ */
/* Drawn to match the design's sidebar, which uses bare glyphs rather than
   the filled/axis-bearing variants used elsewhere in the app. */

/** Statistic: three bars on an implied baseline, no axis drawn. */
export const BarsIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="6" y1="20" x2="6" y2="13" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="18" y1="20" x2="18" y2="9" />
  </Svg>
);

/** A signed-in device, in the Security tab's session list. */
export const MonitorIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
    <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
    <line x1="12" y1="16.5" x2="12" y2="20.5" />
  </Svg>
);

/** Contact number, in the Verification tab. */
export const ContactPhoneIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6.6 3h3l1.5 3.8-2 1.4a12 12 0 0 0 5.7 5.7l1.4-2L20 13.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3z" />
  </Svg>
);

/** Verification: a plain circle, kept distinct from Security's shield. */
export const CircleCheckIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="8.5 12 11 14.5 15.5 9.5" />
  </Svg>
);

/** Transactions: money going out and coming back. */
export const ArrowsUpDownIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="8" y1="19" x2="8" y2="5" />
    <polyline points="5 8 8 5 11 8" />
    <line x1="16" y1="5" x2="16" y2="19" />
    <polyline points="13 16 16 19 19 16" />
  </Svg>
);

/**
 * Log out: the arrow leaves the bracket.
 *
 * `LogInIcon` is its mirror and is what the rail used to borrow — it points
 * the wrong way for a control that ends the session.
 */
export const LogOutIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

export const ChartIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="3" y1="21" x2="21" y2="21" />
    <rect x="5" y="11" width="4" height="8" />
    <rect x="11" y="6" width="4" height="13" />
    <rect x="17" y="14" width="4" height="5" />
  </Svg>
);

export const UsersIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

export const BadgeCheckIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 2l2.4 1.8 3-.3 1 2.8 2.6 1.5-1 2.9 1 2.9-2.6 1.5-1 2.8-3-.3L12 22l-2.4-1.8-3 .3-1-2.8L3 16.2l1-2.9-1-2.9 2.6-1.5 1-2.8 3 .3z" />
    <polyline points="9 12 11 14 15 10" />
  </Svg>
);

export const ReceiptIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 3v18l2.5-1.5L10 21l2-1.5L14 21l2.5-1.5L19 21V3z" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </Svg>
);

export const LifeBuoyIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <line x1="4.9" y1="4.9" x2="9.2" y2="9.2" />
    <line x1="14.8" y1="14.8" x2="19.1" y2="19.1" />
    <line x1="14.8" y1="9.2" x2="19.1" y2="4.9" />
    <line x1="4.9" y1="19.1" x2="9.2" y2="14.8" />
  </Svg>
);

export const SunIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="4.9" y1="4.9" x2="7" y2="7" />
    <line x1="17" y1="17" x2="19.1" y2="19.1" />
    <line x1="4.9" y1="19.1" x2="7" y2="17" />
    <line x1="17" y1="7" x2="19.1" y2="4.9" />
  </Svg>
);

export const HeartIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21.2l7.1-6.8 1.7-1.7a5 5 0 0 0 0-7.1z" />
  </Svg>
);

export const SlidersIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </Svg>
);

export const SortIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="4" y1="7" x2="16" y2="7" />
    <line x1="4" y1="12" x2="13" y2="12" />
    <line x1="4" y1="17" x2="10" y2="17" />
    <polyline points="17 14 20 17 23 14" />
    <line x1="20" y1="17" x2="20" y2="7" />
  </Svg>
);

export const LayersIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Svg>
);

export const SettingsIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const LockIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);

export const CloseIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

/** Enter full screen: four corners pushed outwards. */
export const MaximizeIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </Svg>
);

/** Leave full screen: the same corners drawn back in. */
export const MinimizeIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 3v3a2 2 0 0 1-2 2H3" />
    <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
    <path d="M3 16h3a2 2 0 0 1 2 2v3" />
    <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
  </Svg>
);

/** Open in a window of its own: a frame with an arrow leaving it. */
export const PopoutIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Svg>
);

export const LinkIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);

export const SearchIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
);

export const RefreshIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
    <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
    <polyline points="3 21 3 16 8 16" />
    <polyline points="21 3 21 8 16 8" />
  </Svg>
);

/**
 * Chat reactions. Drawn with `fill="currentColor"` applied by the caller when
 * the viewer has reacted — a filled thumb reads as "pressed" at 14px, where a
 * colour change alone is easy to miss.
 */
export const ThumbsUpIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </Svg>
);

export const ThumbsDownIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </Svg>
);

/** Opens the emoji picker. */
export const SmileIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </Svg>
);

export const SendIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Svg>
);

export const XSocialIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="4" y1="4" x2="20" y2="20" />
    <line x1="20" y1="4" x2="4" y2="20" />
  </Svg>
);

export const FacebookIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M15 3h-2a5 5 0 0 0-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3z" />
  </Svg>
);

export const InstagramIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
  </Svg>
);

export const WhatsappIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.3-5.2A8.4 8.4 0 1 1 21 11.5z" />
    <path d="M9 9.2c.2 2.4 2.4 4.6 4.8 4.8l.9-1.2 1.8.8v1.3c-3.6.6-7.4-3.2-6.8-6.8h1.3l.8 1.8z" />
  </Svg>
);

export const TelegramIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21.5 4 2.9 11.2c-.7.3-.7 1.2 0 1.4l4.6 1.5 1.8 5.3c.2.6 1 .8 1.4.3l2.4-2.6 4.6 3.4c.5.4 1.3.1 1.4-.6L22.6 5c.2-.8-.5-1.3-1.1-1z" />
    <path d="m7.5 14.1 9.9-7.4-7.6 8.6" />
  </Svg>
);

export const PaletteIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18z" />
  </Svg>
);

export const DiamondIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m12 2.5 9.5 9.5L12 21.5 2.5 12z" />
  </Svg>
);

export const SuggestionIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.2h6c0-.4.2-.9.6-1.2A6 6 0 0 0 12 3z" />
  </Svg>
);

export const ArrowUpIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="12" y1="20" x2="12" y2="5" />
    <polyline points="6 11 12 5 18 11" />
  </Svg>
);

/** The diagonal "leaves this page" arrow on the account rail's log-out row. */
export const ArrowUpRightIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </Svg>
);

export const ChevronLeftIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="15 18 9 12 15 6" />
  </Svg>
);

export const ChevronRightIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
);

export const PlayIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </Svg>
);

export const MicIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </Svg>
);

export const InfoIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
);

export const TrashIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);

export const ReplyIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </Svg>
);

export const FlagIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </Svg>
);

export const PauseIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="7" y="5" width="3.5" height="14" rx="1" />
    <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
  </Svg>
);

export const ShareIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
  </Svg>
);

export const BugIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="8" y="6" width="8" height="14" rx="4" />
    <path d="M8 12H4M20 12h-4M8 8 5 5M16 8l3-3M8 17l-3 3M16 17l3 3" />
  </Svg>
);

export const HandshakeIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m11 17 2 2a1.4 1.4 0 0 0 2-2" />
    <path d="m14 15 2.5 2.5a1.4 1.4 0 0 0 2-2L14 11l-2 1.5a2 2 0 0 1-2.5-3L13 6h4l4 4" />
    <path d="M3 10 7 6h4" />
  </Svg>
);

export const MegaphoneIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m3 11 15-6v14L3 13z" />
    <path d="M3 11H2v2h1M7 14v5a1 1 0 0 0 1 1h2" />
  </Svg>
);

export const HelpCircleIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const ScaleIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 4v16M7 20h10" />
    <path d="M4 8h16M4 8l-2 5a3 3 0 0 0 6 0zM20 8l2 5a3 3 0 0 1-6 0z" />
  </Svg>
);

/* --- Sportsbook categories ------------------------------------------- */

export const FootballIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 7.5 3.8 2.8-1.5 4.5H9.7l-1.5-4.5z" />
    <path d="M12 3v4.5M3.6 9.8l4.6.5M20.4 9.8l-4.6.5M6.8 19.6l2.9-4.8M17.2 19.6l-2.9-4.8" />
  </Svg>
);

export const BasketballIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v18M3 12h18" />
    <path d="M5.6 5.6c3.6 3.6 3.6 9.2 0 12.8M18.4 5.6c-3.6 3.6-3.6 9.2 0 12.8" />
  </Svg>
);

export const TennisIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <ellipse cx="9.5" cy="9.5" rx="6" ry="6.5" transform="rotate(-45 9.5 9.5)" />
    <path d="M5.5 5.5 13.5 13.5" />
    <path d="m13.8 13.8 5 5a1.7 1.7 0 0 1-2.4 2.4l-5-5" />
  </Svg>
);

export const CricketIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m4 20 4-4" />
    <path d="M8.5 15.5 18 6a2.1 2.1 0 0 0-3-3l-9.5 9.5z" />
    <circle cx="17.5" cy="17.5" r="3" />
  </Svg>
);

export const HorseIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 21c0-5 2-8 6-9l-1.5-2.5a3 3 0 0 1 2-4.5L14 3l1 2 3 1.5c1.5.8 2 2.2 2 4 0 4.5-3 10.5-8 10.5" />
    <line x1="14.5" y1="6.5" x2="14.51" y2="6.5" />
  </Svg>
);

export const BaseballIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="8" cy="16" r="4.5" />
    <path d="M5 13.2c1.4.6 2.4 1.6 3 3M11 18.8c-.6-1.4-1.6-2.4-3-3" />
    <path d="m12.2 11.8 7-7a2 2 0 0 1 3 3l-7 7" />
  </Svg>
);

export const HockeyIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m3 4 6.5 13H14" />
    <path d="m14 17 4-2.5 3 3" />
    <ellipse cx="6" cy="19.5" rx="3" ry="1.5" />
  </Svg>
);

/** One glyph per catalogue category, shared by the rail, chips and tabs. */
export const CATEGORY_ICONS: Record<GameShelfKey, FC<IconProps>> = {
  originals: SparklesIcon,
  new: ZapIcon,
  featured: StarIcon,
  slots: DiceIcon,
  live: ActivityIcon,
  popular: TrophyIcon,
  trending: ArrowUpRightIcon,
  table: LayersIcon,
  'bonus-buys': GiftIcon,
  'instant-wins': ZapIcon,
  blackjack: LayersIcon,
  roulette: ActivityIcon,
  baccarat: DiamondIcon,
  'game-shows': MicIcon,
  'live-popular': TrophyIcon,
  'live-new': SparklesIcon,
  'live-blackjack': LayersIcon,
  'live-roulette': ActivityIcon,
  'live-game-shows': MicIcon,
  'live-baccarat': DiamondIcon,
  'live-lightning': ZapIcon,
};

export const ShieldCheckIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </Svg>
);

export const AlertTriangleIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Svg>
);

export const RefreshCwIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </Svg>
);

export const EditIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Svg>
);

export const CalendarIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);

export const MapPinIcon: FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

/** One glyph per reward, shared by the rewards tray and the rewards page. */
export const REWARD_ICONS: Record<RewardType, FC<IconProps>> = {
  RAKEBACK: CoinIcon,
  CASHBACK: RefreshIcon,
  DAILY: ClockIcon,
  WEEKLY: GiftIcon,
  MONTHLY: CrownIcon,
};
