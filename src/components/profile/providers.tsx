import type { FC, ReactNode } from 'react';
import Image from 'next/image';
import metamaskLogo from '@/assets/metamask.png';
import { GoogleMark, TelegramMark } from '@/components/brand';
import { MailIcon } from '@/components/icons';
import { translate } from '@/i18n/translate';

/**
 * Who the account is attached to: the host behind the sign-in email, and the
 * third parties a player could one day link.
 *
 * Kept out of the components so that wiring this up later is a change to one
 * file. Each export below says what it is standing in for.
 */

/* ==================================================================== */
/* Mark sizing                                                           */
/* ==================================================================== */

/**
 * The square the design gives every provider mark in a row, in `--u` so it
 * comes down with the row around it. The marks keep their own width/height
 * attributes; `h-full w-full` on the svg overrides them, which is what lets a
 * fixed-size glyph scale.
 */
const SLOT = 'calc(var(--u) * 38)';

/** `Image` still needs a number for its intrinsic size. */
const SLOT_PX = 38;

/**
 * Glyph size for the vector marks.
 *
 * Smaller than the slot on purpose. The fox is raster artwork that carries its
 * own margin — it covers 82% of its canvas — so it is drawn at the full slot
 * and still reads at roughly this size. `GoogleMark` and `TelegramMark` fill
 * their viewBox edge to edge, so drawing them at 38 would make them noticeably
 * larger than the fox beside them.
 */
const GLYPH = 28;

/**
 * Centres a mark in the slot so the icon column lines up down the group.
 *
 * `full` draws the child at the whole slot rather than at the glyph size —
 * the fox is raster artwork carrying its own margin, so it needs the room the
 * vectors do not.
 */
const MarkSlot: FC<{ children: ReactNode; full?: boolean }> = ({ children, full = false }) => (
  <span
    className={`flex shrink-0 items-center justify-center [&_img]:h-full [&_img]:w-full [&_svg]:h-full [&_svg]:w-full ${
      full ? '' : '*:h-[74%] *:w-[74%]'
    }`}
    style={{ width: SLOT, height: SLOT }}
    aria-hidden="true"
  >
    {children}
  </span>
);

/* ==================================================================== */
/* Linked accounts                                                       */
/* ==================================================================== */

export interface LinkableProvider {
  /** Stable key — the provider id the linked-accounts endpoint speaks. */
  key: 'google' | 'telegram' | 'metamask';
  /** Proper noun, deliberately not run through i18n. */
  label: string;
  mark: ReactNode;
}

/**
 * The providers the design offers to link. The *connected* state comes from
 * GET /auth/linked-accounts; this list is only the catalogue.
 */
const google: LinkableProvider = {
  key: 'google',
  label: 'Google',
  mark: (
    <MarkSlot>
      <GoogleMark size={GLYPH} />
    </MarkSlot>
  ),
};

const telegram: LinkableProvider = {
  key: 'telegram',
  label: 'Telegram',
  // TelegramMark draws in `currentColor`, so the brand blue comes from here.
  mark: (
    <MarkSlot>
      <span className="text-[#2aabee]">
        <TelegramMark size={GLYPH} />
      </span>
    </MarkSlot>
  ),
};

const metamask: LinkableProvider = {
  key: 'metamask',
  label: 'Metamask',
  // The fox is raster artwork in the design, not a vector, so it comes in as
  // an asset rather than a sibling of the marks in `brand.tsx`.
  mark: (
    <MarkSlot full>
      <Image src={metamaskLogo} alt="" width={SLOT_PX} height={SLOT_PX} />
    </MarkSlot>
  ),
};

export const LINKED_PROVIDERS: readonly LinkableProvider[] = [google, telegram, metamask];

/**
 * The wallets the Security tab offers to connect.
 *
 * NOT WIRED. There is no wallet-linking endpoint and nothing storing a
 * connected address.
 */
export const WALLET_PROVIDERS: readonly LinkableProvider[] = [metamask];

/* ==================================================================== */
/* The email behind the account                                          */
/* ==================================================================== */

export interface MailHost {
  /** The host's name, or the bare domain when we have no artwork for it. */
  label: string;
  mark: ReactNode;
}

const googleHost: MailHost = {
  label: 'Google',
  mark: (
    <MarkSlot>
      <GoogleMark size={GLYPH} />
    </MarkSlot>
  ),
};

/** Hosts we can put a face to. Anything else falls back to its domain. */
const KNOWN_HOSTS: Record<string, MailHost> = {
  'gmail.com': googleHost,
  'googlemail.com': googleHost,
};

const GenericMailMark: FC = () => (
  <MarkSlot>
    <span className="text-white/50">
      <MailIcon size={GLYPH - 4} />
    </span>
  </MarkSlot>
);

/**
 * The mail host behind an address — the Google mark and name for a Gmail
 * address, the bare domain otherwise.
 *
 * This describes where the mail is *hosted*, which the address alone tells us.
 * It deliberately does not claim the player signed in *through* that provider:
 * `/users/me` returns no `auth_provider`, and a Gmail address is just as
 * likely to belong to a password signup. Swap this for that field when the
 * backend exposes it — the row renders whatever `MailHost` it is handed.
 *
 * Takes the address as nullable because the API sends `null` for accounts with
 * no email on file, and falls back to the generic mark for that case and for
 * anything that does not parse as an address.
 */
export const mailHostOf = (email: string | null | undefined): MailHost => {
  const domain = email?.split('@')[1]?.toLowerCase() ?? '';
  return (
    KNOWN_HOSTS[domain] ?? {
      label: domain || translate('profile.email'),
      mark: <GenericMailMark />,
    }
  );
};
