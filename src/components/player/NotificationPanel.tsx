import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { PanelHeader, PanelIconButton } from '@/components/player/HeaderPopover';
import { BellIcon, SettingsIcon } from '@/components/icons';

/**
 * Notification centre.
 *
 * There is no notifications endpoint yet, so the platform feed below is sample
 * content rather than a live one — same footing as the winners strip and the
 * crash preview. English-only copy on purpose: the strings here belong to the
 * announcements themselves, which will come from the API already localised,
 * so translating placeholders would only create keys to delete later.
 */
interface PlatformNotice {
  id: string;
  sentAt: string;
  title: string;
  body: string;
}

const PLATFORM_NOTICES: PlatformNotice[] = [
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

/** Two-up segmented control; the active half rides on a lighter pill. */
const Tabs: FC<{ active: Tab; onChange: (tab: Tab) => void }> = ({ active, onChange }) => (
  <div className="mx-4 mb-3 flex rounded-full bg-slate-900 p-1" role="tablist">
    {TABS.map((tab) => (
      <button
        key={tab.key}
        type="button"
        role="tab"
        aria-selected={active === tab.key}
        onClick={() => onChange(tab.key)}
        className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          active === tab.key ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

const NoticeCard: FC<{ notice: PlatformNotice }> = ({ notice }) => (
  <article className="rounded-2xl bg-slate-900 border border-slate-700 p-3">
    <p className="text-[11px] text-slate-500">{notice.sentAt}</p>
    <h3 className="mt-1 text-sm font-bold text-white">{notice.title}</h3>

    {/* Artwork slot. The announcement payload has no image field yet, so this
        stays a placeholder block rather than a broken <img>. */}
    <div
      className="mt-2.5 h-24 rounded-xl bg-gradient-to-br from-blue-600/25 to-indigo-600/10 border border-slate-700"
      aria-hidden="true"
    />

    <p className="mt-2.5 text-[11px] leading-relaxed text-slate-400 line-clamp-2">{notice.body}</p>
  </article>
);

/** Shown for Personal, which has no source of its own until accounts emit events. */
const EmptyState: FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-slate-600">
      <BellIcon size={22} />
    </span>
    <p className="text-xs text-slate-500">{message}</p>
  </div>
);

const NotificationPanel: FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('platform');

  return (
    <>
      <PanelHeader
        title={t('nav.notifications')}
        action={
          <PanelIconButton label={t('account.appearance')}>
            <SettingsIcon size={17} />
          </PanelIconButton>
        }
      />

      <Tabs active={tab} onChange={setTab} />

      <div className="max-h-[26rem] space-y-3 overflow-y-auto thin-scrollbar px-4 pb-4">
        {tab === 'platform' ? (
          PLATFORM_NOTICES.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
        ) : (
          <EmptyState message="You have no personal notifications yet." />
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
