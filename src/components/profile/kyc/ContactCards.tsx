import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { RowButton } from '@/components/profile/ProfileInfoRow';
import { mailHostOf } from '@/components/profile/providers';
import { CheckIcon, ContactPhoneIcon } from '@/components/icons';
import type { ApiUser } from '@/types/profile';

/**
 * The two contact points the design puts side by side under the KYC form:
 * the email behind the account, and the number on file.
 *
 * Both read from `/users/me`. Neither is editable here — the email keeps its
 * existing "Change" action while unverified, and there is no endpoint for the
 * phone, so it is shown rather than offered for editing.
 */

/** The green tick the design gives a confirmed contact. */
const VerifiedTick: FC<{ label: string }> = ({ label }) => (
  <span
    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#35d07f] text-[#07080a]"
    aria-label={label}
    title={label}
  >
    <CheckIcon size={11} strokeWidth={3.5} />
  </span>
);

/* Built on the account area's own group and row rather than a shape of its
   own — 13 of inset rather than 18 because, like the Sessions row, what sets
   the height here is a stacked pair of lines. */
const Card: FC<{
  label: string;
  mark: ReactNode;
  title: string;
  value: ReactNode;
  action?: ReactNode;
}> = ({ label, mark, title, value, action }) => (
  <section className="space-y-1.5">
    <h3 className="text-base leading-6 font-normal text-[#9da2b4]">{label}</h3>
    <div className="rl-field-card flex items-center gap-3 rounded-[34px] px-4.5 py-3.25">
      {mark}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base leading-6 font-medium text-[#f0f1f5]">{title}</p>
        <div className="flex min-w-0 items-center gap-1.5 text-xs leading-5 text-[#9da2b4]">
          {value}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </section>
);

interface Props {
  me: ApiUser;
  onChangeEmail: () => void;
}

const ContactCards: FC<Props> = ({ me, onChangeEmail }) => {
  const { t } = useTranslation();
  const host = mailHostOf(me.email);

  return (
    <div className="grid gap-5.5 sm:grid-cols-2">
      <Card
        label={t('profile.emailAccount')}
        mark={host.mark}
        title={host.label}
        value={
          <>
            <span className="min-w-0 truncate">{me.email || t('verify.notProvided')}</span>
            {me.is_email_verified && <VerifiedTick label={t('profile.emailVerified')} />}
          </>
        }
        action={
          me.is_email_verified ? undefined : (
            <RowButton onClick={onChangeEmail}>{t('profile.change')}</RowButton>
          )
        }
      />

      <Card
        label={t('verify.contactInfo')}
        mark={
          <span className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full bg-white/7 text-[#f0f1f5]">
            <ContactPhoneIcon size={20} strokeWidth={1.5} />
          </span>
        }
        title={t('verify.phoneNumber')}
        value={
          <>
            <span className="min-w-0 truncate">{me.mobile || t('verify.notProvided')}</span>
            {/* No verification flag exists for the number — the tick follows
                whether one is on file at all, not a confirmed one. */}
            {Boolean(me.mobile) && <VerifiedTick label={t('verify.phoneNumber')} />}
          </>
        }
      />
    </div>
  );
};

export default ContactCards;
