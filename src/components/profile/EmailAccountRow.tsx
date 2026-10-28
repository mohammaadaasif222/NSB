import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { mailHostOf } from '@/components/profile/providers';
import { VerifiedCheck } from '@/components/profile/profileIcons';

interface Props {
  /** `null` on accounts with no email on file — a mobile-only signup. */
  email: string | null;
  /** Absent on accounts predating the flag, which read as unverified. */
  verified?: boolean;
  /** Given when the account has no email and Email OTP is on: shows "Add & Verify Email". */
  onAddEmail?: () => void;
  onVerifyEmail?: () => void;
}

/**
 * The email behind the account: its host, the address, and whether it has
 * been confirmed.
 *
 * Read-only by design — the address is changed from the Verification tab,
 * which is also where the player is told why it matters.
 */
const EmailAccountRow: FC<Props> = ({ email, verified, onAddEmail, onVerifyEmail }) => {
  const { t } = useTranslation();
  const host = mailHostOf(email);

  return (
    <FieldGroup label={t('profile.emailAccount')} cardClassName="max-lg:py-[3px]">
      <SettingRow
        icon={host.mark}
        title={host.label}
        detail={email || t('profile.notSet')}
        layout="inline"
        action={
          !email ? (
            onAddEmail ? (
              <button
                type="button"
                onClick={onAddEmail}
                className="shrink-0 rounded-full bg-[#fcd535] px-[calc(var(--u)*14)] py-[calc(var(--u)*6)] text-[length:max(min(12px,13px),calc(var(--u)*13))] leading-[1.45] font-semibold text-[#07080a] transition-opacity hover:opacity-90"
              >
                {t('acct.email.addVerify')}
              </button>
            ) : null
          ) : verified ? (
            <VerifiedCheck title={t('profile.emailVerified')} />
          ) : (
            <div className="flex shrink-0 items-center gap-[calc(var(--u)*8)]">
              <span className="rounded-full border border-[#fcd535]/30 bg-[#fcd535]/10 px-[calc(var(--u)*10)] py-[calc(var(--u)*4)] text-[length:max(min(11px,11px),calc(var(--u)*11))] leading-[1.45] font-semibold text-[#fcd535]">
                {t('profile.emailUnverified')}
              </span>
              {onVerifyEmail && (
                <button
                  type="button"
                  onClick={onVerifyEmail}
                  className="shrink-0 rounded-full bg-[#fcd535] px-[calc(var(--u)*14)] py-[calc(var(--u)*6)] text-[length:max(min(12px,13px),calc(var(--u)*13))] leading-[1.45] font-semibold text-[#07080a] transition-opacity hover:opacity-90"
                >
                  {t('acct.email.verifyEmail')}
                </button>
              )}
            </div>
          )
        }
      />
    </FieldGroup>
  );
};

export default EmailAccountRow;
