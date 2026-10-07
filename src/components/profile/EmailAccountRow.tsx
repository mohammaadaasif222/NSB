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
}

/**
 * The email behind the account: its host, the address, and whether it has
 * been confirmed.
 *
 * Read-only by design — the address is changed from the Verification tab,
 * which is also where the player is told why it matters.
 */
const EmailAccountRow: FC<Props> = ({ email, verified }) => {
  const { t } = useTranslation();
  const host = mailHostOf(email);

  return (
    <FieldGroup label={t('profile.emailAccount')}>
      <SettingRow
        icon={host.mark}
        title={host.label}
        detail={email || t('profile.notSet')}
        layout="inline"
        action={
          !email ? null : verified ? (
            <VerifiedCheck title={t('profile.emailVerified')} />
          ) : (
            <span className="rounded-full border border-[#fcd535]/30 bg-[#fcd535]/10 px-[calc(var(--u)*10)] py-[calc(var(--u)*4)] text-[length:max(min(11px,11px),calc(var(--u)*11))] leading-[1.45] font-semibold text-[#fcd535]">
              {t('profile.emailUnverified')}
            </span>
          )
        }
      />
    </FieldGroup>
  );
};

export default EmailAccountRow;
