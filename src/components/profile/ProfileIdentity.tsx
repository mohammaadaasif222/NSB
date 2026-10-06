import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { fullNameOf, initialsOf, type ApiUser } from '@/types/profile';
import { CameraIcon } from '@/components/icons';

interface Props {
  me: ApiUser;
}

/** The avatar, display name and account number at the top of the Profile tab. */
const ProfileIdentity: FC<Props> = ({ me }) => {
  const { t } = useTranslation();
  const name = me.display_name || fullNameOf(me) || me.username || t('account.account');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        {me.avatar_url ? (
          <img src={me.avatar_url} alt="" className="h-34.25 w-34.25 rounded-full object-cover" />
        ) : (
          <span className="flex h-34.25 w-34.25 select-none items-center justify-center rounded-full bg-white/7 text-4xl font-bold text-white">
            {initialsOf(me)}
          </span>
        )}

        {/* NOT WIRED. There is no avatar upload endpoint, so the camera badge
            is shown — the design leans on it to explain the avatar — but it
            does nothing rather than opening a picker it cannot submit.

            The design builds this disc from the same frosted stack as the
            account rail, but that stack darkens what is behind it through a
            colour-burn pass, and a CSS blend cannot reach the photo from
            inside a layer that is itself faded. Flattened to the black wash it
            resolves to — the stack works out to roughly 0.61× whatever it
            covers, which is black at 39% — so it reads correctly over a bright
            portrait and a dark one alike. */}
        <span
          title={t('common.soon')}
          aria-label={`${t('profile.editAvatar')} — ${t('common.soon')}`}
          className="absolute -bottom-1.75 end-1.25 flex h-12 w-12 cursor-default items-center justify-center rounded-full bg-black/39 text-[#f0f1f5] shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        >
          <CameraIcon size={24} strokeWidth={1.5} />
        </span>
      </div>

      <p className="mt-4.25 rl-h-card font-semibold text-[#f0f1f5]">{name}</p>

      <p className="mt-1.5 text-base leading-6 text-[#9da2b4]">
        {t('profile.id')} <span className="tabular-nums">{me.id}</span>
      </p>
    </div>
  );
};

export default ProfileIdentity;
