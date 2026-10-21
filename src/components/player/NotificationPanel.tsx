import { useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import SegmentedTabs from '@/components/player/SegmentedTabs';
import { BellIcon } from '@/components/icons';
import type { TranslationKey } from '@/i18n/locales';
import gearIcon from '@/assets/lobby/profile-menu/gear.svg';
import chevronLeft from '@/assets/lobby/chevron-left.svg';
import { LOBBY_BANNER as noticeArt } from '@/constants/cdn';
import { useAuth } from '@/context/AuthContext';
import {
  getNotifications,
  markAllNotificationsRead,
  type PlayerNotification,
} from '@/services/notifications';

/**
 * Notification centre.
 *
 * Personal notifications come from GET /notifications (e.g. a withdrawal
 * rejection or escalation and its reason). The platform feed below is still
 * sample content; real announcements will replace it wholesale.
 */
export interface Notice {
  id: string;
  sentAt: Date;
  title: TranslationKey;
  body: TranslationKey;
}

const PLATFORM_NOTICES: Notice[] = [
  {
    id: 'fifa-fury-1',
    sentAt: new Date(2026, 6, 23, 14, 58),
    title: 'lobby.notices.fifaTitle',
    body: 'lobby.notices.fifaBody',
  },
  {
    id: 'fifa-fury-2',
    sentAt: new Date(2026, 6, 23, 14, 58),
    title: 'lobby.notices.fifaTitle',
    body: 'lobby.notices.fifaBody',
  },
];

type Tab = 'platform' | 'personal';

const TABS: { key: Tab; label: TranslationKey }[] = [
  { key: 'platform', label: 'lobby.notices.platform' },
  { key: 'personal', label: 'lobby.notices.personal' },
];

/**
 * One announcement: its artwork across the top, then the title, two lines of
 * the message and when it was sent — the design's 424×255 card, a 10% white
 * glass over the panel. On a scaled-down desktop the text keeps the design's
 * 16 / 14 / 12 proportions: each stops at the shared floor in that ratio,
 * not all at the same size.
 */
export const NoticeCard: FC<{ notice: Notice }> = ({ notice }) => {
  const { t, locale } = useTranslation();

  return (
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
        <h3 className="truncate text-[16px] font-medium leading-6 text-[#f0f1f5] lg:text-[length:max(var(--tf,11px),calc(var(--u)*16))] lg:leading-[1.5]">
          {t(notice.title)}
        </h3>
        <p className="mt-2 line-clamp-2 max-w-[349px] text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*8)] lg:text-[length:max(calc(var(--tf,11px)*0.875),calc(var(--u)*14))] lg:max-w-[calc(var(--u)*349)] lg:leading-[1.43] lg:text-[#c8ccd8]">
          {t(notice.body)}
        </p>
        <p className="mt-[11px] text-[12px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*11)] lg:text-[length:max(calc(var(--tf,11px)*0.75),calc(var(--u)*12))] lg:leading-[1.67]">
          {notice.sentAt.toLocaleString(locale, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </article>
  );
};

/** A personal notification: a withdrawal decision and the reason staff gave. */
const PersonalCard: FC<{ item: PlayerNotification }> = ({ item }) => {
  const { locale } = useTranslation();
  return (
    <article className="rounded-[24px] bg-white/10 px-[14px] py-[14px] lg:rounded-[calc(var(--u)*24)] lg:px-[calc(var(--u)*16)] lg:py-[calc(var(--u)*14)]">
      <h3 className="flex items-center gap-2 text-[15px] font-medium leading-6 text-[#f0f1f5]">
        {!item.read_at && (
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#ff5a5f]" aria-hidden />
        )}
        <span className="min-w-0 truncate">{item.title}</span>
      </h3>
      {item.body && <p className="mt-1 text-[14px] leading-5 text-[#c8ccd8]">{item.body}</p>}
      <p className="mt-2 text-[12px] leading-5 text-[#9da2b4]">
        {new Date(item.created_at).toLocaleString(locale, {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </article>
  );
};

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
  'flex h-10 w-10 flex-shrink-0 items-center justify-center rl-glass-btn rounded-full lg:h-[calc(var(--u)*48)] lg:w-[calc(var(--u)*48)]';

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
  const { token } = useAuth();
  const [personal, setPersonal] = useState<PlayerNotification[]>([]);

  useEffect(() => {
    if (!token) return;
    let live = true;
    void getNotifications()
      .then((feed) => {
        if (!live) return;
        setPersonal(feed.rows);
        if (feed.unread > 0) {
          setTab('personal');
          void markAllNotificationsRead().catch(() => undefined);
        }
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [token]);

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
        <h2 className="min-w-0 flex-1 truncate text-[24px] font-medium leading-8 text-[#f0f1f5] lg:text-[length:max(calc(var(--tf,11px)*1.25),calc(var(--u)*20))] lg:leading-[1.4]">
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

      <div className="mt-[19px] lg:mt-[calc(var(--u)*12)]">
        <SegmentedTabs
          items={TABS.map((item) => ({ key: item.key, label: t(item.label) }))}
          active={tab}
          onChange={setTab}
          label={title}
        />
      </div>

      <div
        role="tabpanel"
        className="thin-scrollbar -mx-px mt-[19px] flex min-h-0 flex-1 flex-col gap-[15px] px-px lg:mt-[calc(var(--u)*20)] lg:gap-[calc(var(--u)*14)] lg:overflow-y-auto lg:pb-[calc(var(--u)*36)]"
      >
        {tab === 'platform' ? (
          PLATFORM_NOTICES.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
        ) : personal.length > 0 ? (
          personal.map((item) => <PersonalCard key={item.id} item={item} />)
        ) : (
          <EmptyState message={t('lobby.notices.personalEmpty')} />
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
