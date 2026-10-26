import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { RowButton } from '@/components/profile/SectionShell';
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
    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#35d07f] text-[#07080a] lg:h-[calc(var(--u)*20)] lg:w-[calc(var(--u)*20)]"
    aria-label={label}
    title={label}
  >
    <CheckIcon size={11} strokeWidth={3.5} className="h-[55%] w-[55%]" />
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
  <section className="space-y-[calc(var(--u)*6)]">
    <h3 className="text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-normal text-[#f0f1f5] lg:text-[#9da2b4]">
      {label}
    </h3>
    <div className="rl-field-card flex items-center gap-[calc(var(--u)*12)] rounded-[44px] px-[calc(var(--u)*18)] py-[18px] max-lg:![box-shadow:none] max-lg:before:hidden lg:rounded-[calc(var(--u)*34)] lg:py-[calc(var(--u)*13)]">
      {mark}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] font-medium text-[#f0f1f5]">
          {title}
        </p>
        <div className="flex min-w-0 items-center gap-[calc(var(--u)*6)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] text-[#9da2b4]">
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
    <div className="grid gap-5 sm:grid-cols-2 lg:gap-[calc(var(--u)*22)]">
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
          <span className="flex h-[calc(var(--u)*38)] w-[calc(var(--u)*38)] shrink-0 items-center justify-center rounded-full bg-white/7 text-[#f0f1f5]">
            <ContactPhoneIcon size={20} strokeWidth={1.5} className="h-[53%] w-[53%]" />
          </span>
        }
        title={t('verify.phoneNumber')}
        value={
          <>
            <span className="min-w-0 truncate">
              {me.mobile
                ? `${me.country_code ? `+${me.country_code.replace(/\D/g, '')} ` : ''}${me.mobile}`
                : t('verify.notProvided')}
            </span>
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
