import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { fullNameOf, initialsOf, type ApiUser } from '@/types/profile';
import { CameraIcon } from '@/components/icons';

interface Props {
  me: ApiUser;
  onChangeAvatar: () => void;
}

const ProfileIdentity: FC<Props> = ({ me, onChangeAvatar }) => {
  const { t } = useTranslation();
  const name = me.display_name || fullNameOf(me) || me.username || t('account.account');

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
       
        {me.avatar_url ? (
          <img
            src={me.avatar_url}
            alt=""
            className="h-[calc(var(--u)*137)] w-[calc(var(--u)*137)] rounded-full object-cover"
          />
        ) : (
          <span className="flex h-[calc(var(--u)*137)] w-[calc(var(--u)*137)] items-center justify-center rounded-full bg-white/7 text-[length:max(min(11px,36px),calc(var(--u)*36))] font-bold text-white select-none">
            {initialsOf(me)}
          </span>
        )}

        <button
          type="button"
          onClick={onChangeAvatar}
          aria-label={t('profile.editAvatar')}
          className="absolute end-[calc(var(--u)*5)] -bottom-[calc(var(--u)*7)] flex h-[calc(var(--u)*48)] w-[calc(var(--u)*48)] items-center justify-center rounded-full bg-black/39 text-[#f0f1f5] shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-colors hover:bg-black/55 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
        >
          <CameraIcon
            size={24}
            strokeWidth={1.5}
            className="h-[calc(var(--u)*24)] w-[calc(var(--u)*24)]"
          />
        </button>
      </div>

      {/* Onest SemiBold 20/28 at −0.4, per the design's own H6 style. */}
      <p className="mt-[calc(var(--u)*10)] text-[length:max(min(11px,20px),calc(var(--u)*20))] leading-[1.4] font-semibold tracking-[-0.4px] text-[#f0f1f5]">
        {name}
      </p>

      <p className="mt-[calc(var(--u)*6)] text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] text-[#9da2b4]">
        {t('profile.id')} <span className="tabular-nums">{me.id}</span>
      </p>
    </div>
  );
};

export default ProfileIdentity;
