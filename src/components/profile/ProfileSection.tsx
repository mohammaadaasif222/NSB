import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { fullNameOf, initialsOf, type ApiUser } from '@/types/profile';
import { FieldGroup, SettingRow, SoonToggle } from '@/components/profile/SectionShell';
import ToggleSwitch from '@/components/profile/ToggleSwitch';
import { RowButton } from '@/components/profile/ProfileInfoRow';
import { CheckIcon, LinkIcon, LockIcon, MailIcon, PencilIcon, UserIcon } from '@/components/icons';

/**
 * Third-party accounts a player could attach.
 *
 * There is no linking endpoint — no OAuth handshake, nothing storing a
 * connection — so these are inert switches rather than toggles that would
 * appear to bind an account and forget it on the next load.
 */
const LINKABLE = ['Google', 'Steam', 'Telegram', 'Metamask'];

interface Props {
  me: ApiUser;
  onChangeEmail: () => void;
  onToggle2FA: () => void;
}

/** Identity, the email behind the account, 2FA, and third-party links. */
const ProfileSection: FC<Props> = ({ me, onChangeEmail, onToggle2FA }) => {
  const { t, locale } = useTranslation();

  const name = me.display_name || fullNameOf(me) || me.username || t('account.account');
  const joined = me.created_at
    ? new Date(me.created_at).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      {joined && (
        <p className="text-end text-[11px] text-slate-500">
          {t('profile.joinedAt', { date: joined })}
        </p>
      )}

      {/* --- Identity --------------------------------------------------- */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          {me.avatar_url ? (
            <img
              src={me.avatar_url}
              alt=""
              className="h-24 w-24 rounded-full border-2 border-slate-800 object-cover"
            />
          ) : (
            <span className="flex h-24 w-24 select-none items-center justify-center rounded-full border-2 border-slate-800 bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white">
              {initialsOf(me)}
            </span>
          )}

          {/* No avatar upload endpoint yet, so the affordance is shown but inert. */}
          <span
            title={t('common.soon')}
            aria-label={`${t('profile.editAvatar')} — ${t('common.soon')}`}
            className="absolute bottom-0 end-0 flex h-7 w-7 cursor-default items-center justify-center rounded-full bg-slate-700 border-2 border-slate-900 text-slate-300"
          >
            <PencilIcon size={12} />
          </span>
        </div>

        <p className="mt-3 text-lg font-bold text-white">{name}</p>

        <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800"
            aria-hidden="true"
          >
            <UserIcon size={9} />
          </span>
          {t('profile.id')}
          <span className="font-semibold text-slate-400 tabular-nums">{me.id}</span>
        </p>
      </div>

      {/* --- Email ------------------------------------------------------ */}
      <FieldGroup label={t('profile.emailAccount')}>
        <SettingRow
          icon={<MailIcon size={15} />}
          title={me.email}
          detail={me.is_email_verified ? t('profile.emailVerified') : t('profile.emailUnverified')}
          action={
            <span className="flex items-center gap-2">
              {me.is_email_verified && (
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400"
                  aria-label={t('profile.emailVerified')}
                >
                  <CheckIcon size={13} />
                </span>
              )}
              <RowButton onClick={onChangeEmail}>{t('profile.change')}</RowButton>
            </span>
          }
        />
      </FieldGroup>

      {/* --- 2FA -------------------------------------------------------- */}
      <FieldGroup label={t('profile.twoFactorShort')}>
        <SettingRow
          icon={<LockIcon size={15} />}
          title={t('profile.enable2fa')}
          detail={me.two_factor_enabled ? t('profile.enabled') : t('profile.disabled')}
          action={<ToggleSwitch enabled={me.two_factor_enabled} onToggle={onToggle2FA} />}
        />
      </FieldGroup>

      {/* --- Linked accounts -------------------------------------------- */}
      <FieldGroup label={t('profile.linkedAccounts')}>
        {LINKABLE.map((provider) => (
          <SettingRow
            key={provider}
            icon={<LinkIcon size={14} />}
            title={provider}
            action={<SoonToggle label={provider} />}
          />
        ))}
      </FieldGroup>
    </div>
  );
};

export default ProfileSection;
