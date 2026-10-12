import { useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import SegmentedTabs from '@/components/player/SegmentedTabs';
import { BellIcon } from '@/components/icons';
import gearIcon from '@/assets/lobby/profile-menu/gear.svg';
import chevronLeft from '@/assets/lobby/chevron-left.svg';
import noticeArt from '@/assets/lobby/casino/banner.webp';

/**
 * Notification centre.
 *
 * There is no notifications endpoint yet, so the platform feed below is sample
 * content rather than a live one — same footing as the winners strip and the
 * crash preview. English-only copy on purpose: the strings here belong to the
 * announcements themselves, which will come from the API already localised,
 * so translating placeholders would only create keys to delete later.
 */
export interface Notice {
  id: string;
  sentAt: string;
  title: string;
  body: string;
}

const PLATFORM_NOTICES: Notice[] = [
  {
    id: 'fifa-fury-1',
    sentAt: '07/23/26, 02:58 PM',
    title: "Enter FIFA Fury World Cup '26",
    body: 'The biggest football event in history is live! A massive $600 000 prize pool awaits you on the tournament board.',
  },
  {
    id: 'fifa-fury-2',
    sentAt: '07/23/26, 02:58 PM',
    title: "Enter FIFA Fury World Cup '26",
    body: 'The biggest football event in history is live! A massive $600 000 prize pool awaits you on the tournament board.',
  },
];

type Tab = 'platform' | 'personal';

const TABS: { key: Tab; label: string }[] = [
  { key: 'platform', label: 'Platform' },
  { key: 'personal', label: 'Personal' },
];

/**
 * One announcement: its artwork across the top, then the title, two lines of
 * the message and when it was sent — the design's 424×255 card.
 */
export const NoticeCard: FC<{ notice: Notice }> = ({ notice }) => (
  <article className="overflow-hidden rounded-[24px] bg-white/10 lg:rounded-[calc(var(--u)*24)]">
    {/* The announcement payload has no image yet, so every card wears the lobby art. */}
    <div className="relative h-[123px] lg:h-[calc(var(--u)*121)]">
      <Image
        src={noticeArt}
        alt=""
        fill
        sizes="(max-width: 1023px) 100vw, 424px"
        className="object-cover"
      />
    </div>
    <div className="px-[14px] pb-[18px] pt-[11px] lg:px-[calc(var(--u)*16)] lg:pb-[calc(var(--u)*18)] lg:pt-[calc(var(--u)*13)]">
      <h3 className="truncate text-[16px] font-medium leading-6 text-[#f0f1f5] lg:text-[length:max(min(11px,16px),calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
        {notice.title}
      </h3>
      <p className="mt-2 line-clamp-2 max-w-[349px] text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*8)] lg:text-[length:max(min(11px,14px),calc(var(--u)*14))] lg:max-w-[calc(var(--u)*349)] lg:leading-[calc(var(--u)*20)] lg:text-[#c8ccd8]">
        {notice.body}
      </p>
      <p className="mt-[11px] text-[12px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*11)] lg:text-[length:max(min(11px,12px),calc(var(--u)*12))] lg:leading-[calc(var(--u)*20)]">
        {notice.sentAt}
      </p>
    </div>
  </article>
);

/** Shown for Personal, which has no source of its own until accounts emit events. */
const EmptyState: FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] bg-white/5 px-6 py-14 text-center lg:rounded-[calc(var(--u)*24)]">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#9da2b4]">
      <BellIcon size={22} />
    </span>
    <p className="text-[14px] leading-5 text-[#9da2b4]">{message}</p>
  </div>
);

/** A round glass control in the panel's header — back on a phone, settings everywhere. */
const ROUND =
  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-black/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-colors hover:bg-white/10 lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)]';

/**
 * The notification centre, as both designs draw it: the title with a
 * settings control, Platform / Personal, then the announcements. A dropdown
 * under the bell on desktop; on a phone a screen of its own, with a back
 * button where the dropdown has none.
 */
const NotificationPanel: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('platform');
  const title = t('nav.notifications');

  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-4 lg:h-[calc(var(--u)*716)] lg:px-[calc(var(--u)*20)] lg:pb-0 lg:pt-[calc(var(--u)*20)]">
      <header className="flex items-center gap-3 lg:gap-0">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('auth.back')}
          className={`${ROUND} lg:hidden`}
        >
          <img src={chevronLeft.src} alt="" className="h-5 w-5" />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-[24px] font-medium leading-8 text-[#f0f1f5] lg:text-[length:max(min(11px,20px),calc(var(--u)*20))] lg:leading-[calc(var(--u)*28)]">
          {title}
        </h2>
        <Link
          href="/profile?section=preferences"
          onClick={onClose}
          aria-label={t('profile.preferences')}
          title={t('profile.preferences')}
          className={ROUND}
        >
          <img
            src={gearIcon.src}
            alt=""
            className="h-5 w-5 lg:h-[calc(var(--u)*24)] lg:w-[calc(var(--u)*24)]"
          />
        </Link>
      </header>

      <div className="mt-[15px] lg:mt-[calc(var(--u)*12)]">
        <SegmentedTabs items={TABS} active={tab} onChange={setTab} label={title} />
      </div>

      <div
        role="tabpanel"
        className="thin-scrollbar -mx-px mt-[19px] flex min-h-0 flex-1 flex-col gap-[15px] px-px lg:mt-[calc(var(--u)*20)] lg:gap-[calc(var(--u)*14)] lg:overflow-y-auto lg:pb-[calc(var(--u)*36)]"
      >
        {tab === 'platform' ? (
          PLATFORM_NOTICES.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
        ) : (
          <EmptyState message="You have no personal notifications yet." />
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
