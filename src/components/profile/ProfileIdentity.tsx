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
            className="h-[100px] w-[100px] rounded-full object-cover lg:h-[calc(var(--u)*137)] lg:w-[calc(var(--u)*137)]"
          />
        ) : (
          <span className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[#1a1a1a] text-[28px] font-bold text-white select-none lg:h-[calc(var(--u)*137)] lg:w-[calc(var(--u)*137)] lg:bg-white/7 lg:text-[length:max(min(11px,36px),calc(var(--u)*36))]">
            {initialsOf(me)}
          </span>
        )}

        <button
          type="button"
          onClick={onChangeAvatar}
          aria-label={t('profile.editAvatar')}
          className="absolute end-0 bottom-0 flex h-7 w-7 items-center justify-center rl-glass-btn rounded-full text-[#f0f1f5] shadow-[0_8px_40px_rgba(0,0,0,0.12)] focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none lg:end-[calc(var(--u)*5)] lg:-bottom-[calc(var(--u)*7)] lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)]"
        >
          <CameraIcon
            size={24}
            strokeWidth={1.5}
            className="h-4 w-4 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
          />
        </button>
      </div>

      {/* Onest SemiBold 20/28 at −0.4, per the design's own H6 style. */}
      <p className="mt-2.5 text-[18px] leading-6 font-semibold text-[#f0f1f5] lg:mt-[calc(var(--u)*17)] lg:text-[length:max(min(11px,20px),calc(var(--u)*20))] lg:leading-[1.4] lg:tracking-[-0.4px]">
        {name}
      </p>

      <p className="mt-1.5 text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*6)] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[1.5]">
        {t('profile.id')} <span className="tabular-nums">{me?.username ?? me?.id ?? '--'}</span>
      </p>
    </div>
  );
};

export default ProfileIdentity;
