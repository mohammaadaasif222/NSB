import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { SessionDeviceIcon } from '@/components/profile/security/securityIcons';
import { MOCK_SESSIONS } from './mockSessions';

/**
 * Where the account is signed in.
 *
 * NOT WIRED. Both revoke controls are inert — see `mockSessions.ts`. They are
 * rendered as static labels rather than buttons so that nothing here takes a
 * click it cannot honour; ending a session is exactly the kind of action a
 * player would trust had happened.
 *
 * Its own renderer rather than `FieldGroup`: the group's heading line carries
 * a control of its own on the closing edge, which the shared group has no room
 * for.
 */
const SessionsGroup: FC = () => {
  const { t } = useTranslation();

  return (
    <section className="space-y-[calc(var(--u)*6)]">
      <div className="flex items-center justify-between gap-[calc(var(--u)*12)]">
        <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#9da2b4]">
          {t('sec.sessions')}
        </h3>
        <span
          title={t('common.soon')}
          className="cursor-default pe-[calc(var(--u)*16)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] text-[#e33827]"
        >
          {t('sec.endAllSessions')}
        </span>
      </div>

      {/* 13 of padding rather than the 18 a one-line row gets. What sets this
          row's height is the 48px button, not the text beside it, and the
          design holds the card at the same 74 either way by taking the
          difference out of the inset.

          The button drops to its own line below `sm`. Held beside the text it
          takes 147 of a phone's ~296, which left the device name truncated to
          "Wind…" and the address line to nothing. */}
      <div className="rl-field-card overflow-hidden rounded-[calc(var(--u)*44)]">
        {MOCK_SESSIONS.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-[calc(var(--u)*12)] px-[calc(var(--u)*18)] py-[calc(var(--u)*13)] sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-[calc(var(--u)*12)]">
              <SessionDeviceIcon />

              <div className="min-w-0 flex-1">
                <p className="truncate text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
                  {s.device}
                </p>
                {/* The design separates these with bullets rather than middots,
                    and sets the line a size below the row's label. */}
                <p className="truncate text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]">
                  {[s.current ? t('sec.currentSession') : null, s.ip, s.location, s.lastSeen]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>
            </div>

            <span
              title={t('common.soon')}
              className="rl-chip-danger ms-[calc(var(--u)*50)] flex h-[calc(var(--u)*48)] w-fit shrink-0 cursor-default items-center px-[calc(var(--u)*22)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#e33827] sm:ms-0"
            >
              {t('sec.endSession')}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SessionsGroup;
