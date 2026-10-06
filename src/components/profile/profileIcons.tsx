import type { FC } from 'react';

/**
 * Two marks the Profile tab needs that the shared line set has no equivalent
 * for — both traced from the Figma "Profile" node.
 */

/**
 * The square the design gives every mark in a row — the same slot
 * `providers.tsx` uses, in `--u` so it comes down with the row around it.
 * The SVG's own width/height attributes are overridden by `h-full w-full`,
 * which is what lets a fixed-size glyph scale.
 */
const SLOT = 'calc(var(--u) * 38)';
const CHECK = 'calc(var(--u) * 32)';

/**
 * 2FA: a handset showing a one-time code, not a shield.
 *
 * The rail's shield says "this area is about security"; this says "a code
 * arrives on your phone", which is the thing the row's switch turns on. Drawn
 * at 29px inside the 38px slot so it sits on the same baseline as the brand
 * marks in the groups above and below it.
 */
export const TwoFactorIcon: FC = () => (
  <span
    className="flex shrink-0 items-center justify-center text-[#f0f1f5]"
    style={{ width: SLOT, height: SLOT }}
    aria-hidden="true"
  >
    <svg
      className="h-[77%] w-[77%]"
      width="29.2422"
      height="29.2422"
      viewBox="0 0 29.2422 29.2422"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M28.7422 7.61738V10.9607C28.7422 12.9213 27.176 14.5156 25.2266 14.5613L17.2109 14.5619C16.1381 15.742 14.6375 17.4254 14.6375 17.4254C14.6375 17.4254 13.1369 15.742 12.0652 14.5619L4.10176 14.5625C2.1125 14.5625 0.5 12.95 0.5 10.9607V7.61738C0.5 5.62813 2.1125 4.01562 4.10176 4.01562H25.1404C27.1297 4.01562 28.7422 5.62813 28.7422 7.61738Z" />
      <path d="M22.3389 7.53125V11.0469" />
      <path d="M6.87014 7.53125V11.0469" />
      <path d="M5.35613 8.42451L8.40072 10.1823" />
      <path d="M5.37271 10.1823L8.4173 8.42451" />
      <path d="M14.6377 7.53125V11.0469" />
      <path d="M16.1517 8.42451L13.1071 10.1823" />
      <path d="M16.1351 10.1823L13.0905 8.42451" />
      <path d="M20.8249 8.42451L23.8695 10.1823" />
      <path d="M20.8415 10.1823L23.8861 8.42451" />
      <path d="M6.87852 9.31309V9.30371" />
      <path d="M22.3637 9.31309V9.30371" />
      <path d="M22.3637 14.5613V27.0811C22.3637 27.9986 21.6201 28.7422 20.7025 28.7422H8.53965C7.62207 28.7422 6.87852 27.9986 6.87852 27.0811V14.5625" />
      <path d="M6.87852 4.01562V2.16113C6.87852 1.24355 7.62207 0.5 8.53965 0.5H20.7025C21.6201 0.5 22.3637 1.24355 22.3637 2.16113V4.01562" />
      <path d="M12.6154 25.2266H16.6268" />
    </svg>
  </span>
);

/**
 * The mark on a confirmed email: a filled disc with the check knocked out of
 * it. Two-tone by design — it is the one bright thing in the row, so it keeps
 * literal colours rather than inheriting the row's ink.
 */
export const VerifiedCheck: FC<{ title?: string }> = ({ title }) => (
  <svg
    style={{ width: CHECK, height: CHECK }}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
  >
    {title && <title>{title}</title>}
    <circle cx="16" cy="16" r="16" fill="#F0F1F5" />
    <path
      d="M7.60707 16.2751L14.3688 22.102L22.6404 9.14101"
      stroke="#07080A"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
