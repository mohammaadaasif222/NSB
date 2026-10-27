import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SessionDeviceIcon } from '@/components/profile/security/securityIcons';
import { END_ALL, useSessions } from '@/hooks/useSessions';
import type { PlayerSession } from '@/types';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Where the account is signed in.
 *
 * Its own renderer rather than `FieldGroup`: the group's heading line carries
 * a control of its own on the closing edge, which the shared group has no room
 * for.
 */
const SessionsGroup: FC = () => {
  const { t, locale } = useTranslation();
  const { sessions, loading, error, busy, refresh, endOne, endAll } = useSessions();

  const deviceOf = (session: PlayerSession): string => {
    if (session.os && session.browser) return `${session.os}(${session.browser})`;
    return session.os || session.browser || t('sec.unknownDevice');
  };

  const placeOf = (session: PlayerSession): string | null => {
    if (session.country && session.city) return `${session.country}, ${session.city}`;
    return session.country || session.city || null;
  };

  const ago = (iso: string): string => {
    const at = new Date(iso).getTime();

    if (Number.isNaN(at)) return '';

    const elapsed = Math.max(0, Date.now() - at);

    if (elapsed < MINUTE) return t('sec.justNow');

    const [unit, size]: [Intl.RelativeTimeFormatUnit, number] =
      elapsed < HOUR ? ['minute', MINUTE] : elapsed < DAY ? ['hour', HOUR] : ['day', DAY];

    try {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'always', style: 'short' }).format(
        -Math.round(elapsed / size),
        unit
      );
    } catch {
      return t('acct.sessions.daysAgo', { count: Math.round(elapsed / DAY) });
    }
  };

  const exactly = (iso: string): string => {
    const at = new Date(iso);
    return Number.isNaN(at.getTime()) ? '' : at.toLocaleString(locale);
  };

  return (
    <section className="space-y-[calc(var(--u)*6)]">
      <div className="flex items-center justify-between gap-[calc(var(--u)*12)]">
        <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
          {t('sec.sessions')}
        </h3>
        <button
          type="button"
          onClick={() => void endAll()}
          disabled={loading || busy !== null || sessions.length === 0}
          className="cursor-pointer lg:pe-[calc(var(--u)*16)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] text-[#e33827] transition-opacity hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
        >
          {busy === END_ALL ? t('sec.endingSessions') : t('sec.endAllSessions')}
        </button>
      </div>

      <div className="rl-field-card overflow-hidden rounded-[24px] max-lg:![box-shadow:none] max-lg:before:hidden lg:rounded-[calc(var(--u)*44)]">
        {loading && (
          <p className="px-[calc(var(--u)*18)] py-[calc(var(--u)*24)] text-center text-[length:max(min(11px,14px),calc(var(--u)*14))] text-[#9da2b4]">
            {t('common.loading')}
          </p>
        )}

        {!loading && error && (
          <div className="px-[calc(var(--u)*18)] py-[calc(var(--u)*24)] text-center">
            <p className="text-[length:max(min(11px,14px),calc(var(--u)*14))] text-[#ef4462]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rl-btn-gold mt-3 rounded-full px-4 py-2 text-xs font-semibold"
            >
              {t('profile.retry')}
            </button>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="px-[calc(var(--u)*18)] py-[calc(var(--u)*24)] text-center text-[length:max(min(11px,14px),calc(var(--u)*14))] text-[#9da2b4]">
            {t('sec.noSessions')}
          </p>
        )}

        {/* 13 of padding rather than the 18 a one-line row gets. What sets this
            row's height is the 48px button, not the text beside it, and the
            design holds the card at the same 74 either way by taking the
            difference out of the inset.

            The button drops to its own line below `sm`. Held beside the text it
            takes 147 of a phone's ~296, which left the device name truncated to
            "Wind…" and the address line to nothing. */}
        {!loading &&
          !error &&
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-4 border-t border-white/5 px-[calc(var(--u)*18)] py-4 first:border-t-0 sm:flex-row sm:items-center lg:gap-[calc(var(--u)*12)] lg:py-[calc(var(--u)*13)]"
            >
              <div className="flex min-w-0 flex-1 items-center gap-[calc(var(--u)*12)]">
                <SessionDeviceIcon />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
                    {deviceOf(session)}
                  </p>
                  {/* The design separates these with bullets rather than middots,
                      and sets the line a size below the row's label. */}
                  <p
                    title={exactly(session.signed_in_at)}
                    className="truncate text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]"
                  >
                    {[
                      session.current ? t('sec.currentSession') : null,
                      placeOf(session),
                      ago(session.signed_in_at),
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void endOne(session.id)}
                disabled={busy !== null}
                className="rl-chip-danger flex h-[calc(var(--u)*48)] w-full shrink-0 cursor-pointer items-center justify-center px-[calc(var(--u)*22)] sm:w-fit text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#e33827] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy === session.id ? t('sec.endingSessions') : t('sec.endSession')}
              </button>
            </div>
          ))}
      </div>
    </section>
  );
};

export default SessionsGroup;
