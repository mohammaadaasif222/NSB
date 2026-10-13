import type { FC, ReactNode } from 'react';
import { MailIcon, PhoneIcon, UserIcon } from '@/components/auth/AuthField';

/**
 * The "Register with" / "Login with" method picker.
 *
 * Presentation only: it reports which method was chosen and nothing else.
 * Today only `mail` leads anywhere — the pages hand the rest to a "coming
 * soon" notice — but the buttons are drawn at full contrast so the screen
 * reads the way it will once the providers are wired up.
 */

export type AuthMethodId = 'gmail' | 'telegram' | 'steam' | 'phone' | 'mail' | 'username';

export interface AuthMethod {
  id: AuthMethodId;
  label: string;
}

interface Props {
  methods: AuthMethod[];
  onSelect: (id: AuthMethodId) => void;
  /** Label for the muted "other options" row. */
  otherLabel?: string;
  onSelectOther?: () => void;
}

const GoogleIcon: FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
  </svg>
);

const TelegramIcon: FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1L18.1 6c.4-.4-.1-.6-.6-.2L7.1 12.4l-5-1.6c-1.1-.3-1.1-1 .2-1.5l19.5-7.5c.9-.3 1.7.2 1.1 2.5z" />
  </svg>
);

const SteamIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="8.5" cy="15" r="2.2" fill="currentColor" />
    <circle cx="15" cy="8.5" r="2.8" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="15" cy="8.5" r="1" fill="currentColor" />
    <path d="M8.9 14.2 12.8 10.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const ICONS: Record<AuthMethodId, ReactNode> = {
  gmail: <GoogleIcon />,
  telegram: <TelegramIcon size={17} />,
  steam: <SteamIcon size={18} />,
  phone: <PhoneIcon />,
  mail: <MailIcon />,
  username: <UserIcon />,
};

const AuthMethods: FC<Props> = ({ methods, onSelect, otherLabel, onSelectOther }) => (
  <div className="space-y-3">
    {methods.map((m) => (
      <button
        key={m.id}
        type="button"
        onClick={() => onSelect(m.id)}
        className="glass-btn h-13 flex items-center justify-center gap-2.5 text-[15px] font-semibold"
      >
        <span className="text-white/80">{ICONS[m.id]}</span>
        {m.label}
      </button>
    ))}

    {otherLabel && onSelectOther && (
      <button
        type="button"
        onClick={onSelectOther}
        className="flex h-13 w-full items-center justify-center gap-2.5 glass-pill rounded-[14px] text-[13px] font-semibold text-white/75 hover:text-white"
      >
        <span className="flex items-center gap-1.5 text-white/70">
          <GoogleIcon size={14} />
          <TelegramIcon size={13} />
          <SteamIcon size={14} />
        </span>
        {otherLabel}
      </button>
    )}
  </div>
);

export default AuthMethods;
