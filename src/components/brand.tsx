import type { FC } from 'react';

/**
 * Multi-colour brand marks.
 *
 * Kept apart from `icons.tsx` because these are not line icons: they carry
 * their own fills and cannot take `currentColor`, so they do not belong in a
 * set whose whole contract is "inherits the text colour".
 *
 * The payment marks are deliberately simplified renderings — a recognisable
 * shape and the right colours at badge size — rather than traced copies of
 * the issuers' artwork, which is trademarked and not ours to redistribute.
 */

interface MarkProps {
  className?: string;
}

/* ==================================================================== */
/* Sign-in providers                                                     */
/* ==================================================================== */

/** The Gmail envelope. */
export const GmailMark: FC<{ size?: number; className?: string }> = ({
  size = 22,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path d="M2.5 6.4A2.4 2.4 0 0 1 4.9 4h.6L12 9.6 18.5 4h.6A2.4 2.4 0 0 1 21.5 6.4v11.2A2.4 2.4 0 0 1 19.1 20h-1.6V9.9L12 14.5 6.5 9.9V20H4.9a2.4 2.4 0 0 1-2.4-2.4z" />
    <path d="M2.5 6.4A2.4 2.4 0 0 1 4.9 4h.6v16H4.9a2.4 2.4 0 0 1-2.4-2.4z" fill="#C5221F" />
    <path d="M5.5 4 12 9.6 18.5 4v5.9L12 14.5 5.5 9.9z" fill="#EA4335" />
    <path
      d="M18.5 4h.6a2.4 2.4 0 0 1 2.4 2.4v11.2a2.4 2.4 0 0 1-2.4 2.4h-1.6V9.9l1-1z"
      fill="#FBBC04"
    />
    <path d="M5.5 20V9.9L12 14.5v.1L6.9 20z" fill="#34A853" />
    <path d="M17.5 20V9.9L12 14.5v.1L17.1 20z" fill="#4285F4" />
  </svg>
);

/** The Google "G". */
export const GoogleMark: FC<{ size?: number; className?: string }> = ({
  size = 22,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M21.6 12.2c0-.7-.06-1.36-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.74 3-4.3 3-7.3z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.7 0 4.96-.9 6.6-2.44l-3.2-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.8-1.76-5.6-4.12H3.1v2.58A10 10 0 0 0 12 22z"
      fill="#34A853"
    />
    <path d="M6.4 13.9a6 6 0 0 1 0-3.82V7.5H3.1a10 10 0 0 0 0 9z" fill="#FBBC05" />
    <path
      d="M12 5.98c1.47 0 2.78.5 3.82 1.5l2.84-2.84C16.95 3.02 14.7 2 12 2a10 10 0 0 0-8.9 5.5l3.3 2.58C7.2 7.74 9.4 5.98 12 5.98z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Filled social marks for the hero's round shortcuts. They take
 * `currentColor`, so each call site supplies its brand colour.
 */
export const TelegramMark: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1L18.1 6c.4-.4-.1-.6-.6-.2L7.1 12.4l-5-1.6c-1.1-.3-1.1-1 .2-1.5l19.5-7.5c.9-.3 1.7.2 1.1 2.5z" />
  </svg>
);

export const FacebookMark: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.2H7.6v3.7h2.7V22H14v-9.8h2.8l.4-3.7z" />
  </svg>
);

export const WhatsappMark: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.6-4.1-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9.9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z" />
  </svg>
);

/* ==================================================================== */
/* Payment marks                                                         */
/* ==================================================================== */

/** The white plate every payment mark sits on in the footer. */
const Plate: FC<{ label: string; className?: string; children: React.ReactNode }> = ({
  label,
  className = '',
  children,
}) => (
  <span
    role="img"
    aria-label={label}
    title={label}
    className={`inline-flex h-7 w-[46px] flex-shrink-0 items-center justify-center rounded-[6px] bg-white ${className}`}
  >
    {children}
  </span>
);

export const VisaMark: FC<MarkProps> = ({ className }) => (
  <Plate label="Visa" className={className}>
    <span className="text-[11px] font-extrabold italic tracking-tight text-[#1A1F71]">VISA</span>
  </Plate>
);

export const ApplePayMark: FC<MarkProps> = ({ className }) => (
  <Plate label="Apple Pay" className={className}>
    <svg width="34" height="14" viewBox="0 0 34 14" fill="#000" aria-hidden="true">
      <path d="M6.9 2.2c.4-.5.7-1.2.6-1.9-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.8.7.05 1.3-.33 1.7-.8zM7.5 3.2c-.95-.06-1.75.53-2.2.53s-1.14-.5-1.88-.49c-.97.01-1.86.56-2.36 1.43-1 1.75-.26 4.34.72 5.76.48.7 1.05 1.48 1.8 1.45.72-.03 1-.47 1.87-.47s1.11.47 1.87.45c.78-.01 1.27-.7 1.74-1.4.55-.8.78-1.58.79-1.62-.02-.01-1.52-.59-1.53-2.32-.01-1.45 1.18-2.14 1.24-2.18-.68-1-1.73-1.11-2.1-1.14z" />
      <text x="11" y="11" fontSize="10" fontWeight="600" fontFamily="sans-serif">
        Pay
      </text>
    </svg>
  </Plate>
);

export const GPayMark: FC<MarkProps> = ({ className }) => (
  <Plate label="Google Pay" className={className}>
    <svg width="36" height="14" viewBox="0 0 36 14" aria-hidden="true">
      <text x="0" y="11" fontSize="11" fontWeight="700" fontFamily="sans-serif" fill="#4285F4">
        G
      </text>
      <text x="9" y="11" fontSize="10" fontWeight="600" fontFamily="sans-serif" fill="#5F6368">
        Pay
      </text>
    </svg>
  </Plate>
);

export const PaypalMark: FC<MarkProps> = ({ className }) => (
  <Plate label="PayPal" className={className}>
    <svg width="38" height="14" viewBox="0 0 38 14" aria-hidden="true">
      <text x="0" y="11" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#003087">
        Pay
      </text>
      <text x="17" y="11" fontSize="10" fontWeight="800" fontFamily="sans-serif" fill="#009CDE">
        Pal
      </text>
    </svg>
  </Plate>
);

export const MastercardMark: FC<MarkProps> = ({ className }) => (
  <Plate label="Mastercard" className={className}>
    <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true">
      <circle cx="13" cy="10" r="6.5" fill="#EB001B" />
      <circle cx="21" cy="10" r="6.5" fill="#F79E1B" />
      <path d="M17 5.1a6.5 6.5 0 0 0 0 9.8 6.5 6.5 0 0 0 0-9.8z" fill="#FF5F00" />
    </svg>
  </Plate>
);

export const AmexMark: FC<MarkProps> = ({ className }) => (
  <Plate label="American Express" className={`!bg-[#1F72CD] ${className ?? ''}`}>
    <span className="text-[8px] font-extrabold leading-none tracking-tight text-white">AMEX</span>
  </Plate>
);

export const SkrillMark: FC<MarkProps> = ({ className }) => (
  <Plate label="Skrill" className={className}>
    <span className="text-[10px] font-extrabold lowercase tracking-tight text-[#862165]">
      skrill
    </span>
  </Plate>
);

/** Every payment mark the footer shows, in design order. */
export const PAYMENT_MARKS: FC<MarkProps>[] = [
  VisaMark,
  ApplePayMark,
  GPayMark,
  PaypalMark,
  SkrillMark,
  MastercardMark,
  AmexMark,
];
