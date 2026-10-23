import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';

/** What a row waiting on content shows in place of its tiles. */
const ComingSoonCard: FC<{ body?: string }> = ({ body }) => {
  const { t } = useTranslation();

  return (
    <div className="rl-liquid flex h-[120px] flex-col items-center justify-center gap-2 rounded-[24px] px-4 text-center lg:h-[calc(var(--u)*180)] lg:gap-[calc(var(--u)*10)] lg:rounded-[calc(var(--u)*24)]">
      <span className="rounded-full bg-[#ffe779]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ffe779] lg:px-[calc(var(--u)*14)] lg:py-[calc(var(--u)*5)] lg:text-[length:max(10px,calc(var(--u)*12))]">
        {t('lobby.live.comingSoon')}
      </span>
      <span className="text-xs text-white/45 lg:text-[length:max(11px,calc(var(--u)*14))]">
        {body ?? t('lobby.casino.comingSoonBody')}
      </span>
    </div>
  );
};

export default ComingSoonCard;
