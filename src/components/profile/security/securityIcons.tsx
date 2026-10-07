import type { FC } from 'react';

/**
 * A signed-in device, traced from the Figma "Security" node.
 *
 * A laptop with a key on its screen rather than the shared `MonitorIcon` —
 * the design distinguishes "a machine your account is open on" from a plain
 * display, and the key is what carries that.
 *
 * Drawn flipped: Figma composes the glyph upside down and rights it with a
 * half turn and a mirror, which together are a vertical flip. Carried as the
 * flip rather than re-plotting every point, so the paths stay the file's.
 */
export const SessionDeviceIcon: FC = () => (
  <span
    className="flex h-[calc(var(--u)*38)] w-[calc(var(--u)*38)] shrink-0 items-center justify-center text-[#f0f1f5]"
    aria-hidden="true"
  >
    <svg
      className="-scale-y-100 h-[58%] w-[79%]"
      width="30.1836"
      height="21.9989"
      viewBox="0 0 30.1836 21.9989"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeMiterlimit="10"
      strokeLinejoin="round"
    >
      <path d="M26.7177 4.15212H3.46586V20.0601C3.46586 20.8547 4.11002 21.4989 4.90463 21.4989H25.279C26.0736 21.4989 26.7177 20.8547 26.7177 20.0601V4.15212Z" />
      <path d="M20.307 12.148C20.307 10.4376 18.9204 9.05105 17.2094 9.05105C15.499 9.05105 14.1124 10.4376 14.1124 12.148H17.2094V15.2457C18.9204 15.2457 20.307 13.8584 20.307 12.148Z" />
      <path d="M29.6836 4.15213H0.5V2.97667C0.5 1.60886 1.60886 0.5 2.97667 0.5H27.2069C28.5747 0.5 29.6836 1.60886 29.6836 2.97667V4.15213Z" />
      <path d="M17.2094 12.148H12.2012V17.1569H17.2094V12.148Z" />
    </svg>
  </span>
);
