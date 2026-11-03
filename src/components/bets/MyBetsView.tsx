import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '@/context/I18nContext';
import { SearchIcon } from '@/components/icons';
import BetsTable from '@/components/profile/transactions/BetsTable';
import BetSlipModal from '@/components/profile/transactions/BetSlipModal';
import TablePager from '@/components/profile/transactions/TablePager';
import {
  fetchBetGames,
  fetchBets,
  fetchBetsForExport,
  type BetRow,
  type BetSort,
} from '@/components/profile/transactions/mockTransactions';
import { betsCsvFilename, betsToCsv } from '@/components/profile/transactions/bets.rules';
import FilterDropdown from './FilterDropdown';

const PAGE_SIZE = 11;

type Tab = 'casino' | 'sportsbook';
type Notice = { kind: 'error' | 'info'; text: string } | null;

const chip = (selected: boolean): string =>
  `flex h-[calc(var(--u)*32)] shrink-0 items-center justify-center rounded-full px-[calc(var(--u)*15)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.67] whitespace-nowrap ${
    selected
      ? 'rl-chip-active font-medium text-[#ffe779]'
      : 'rl-chip font-normal text-[#9da2b4] hover:rl-chip-active hover:font-medium hover:text-[#ffe779]'
  }`;

const download = (filename: string, text: string): void => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * My Bets: every bet the player has made, a tab per product. Casino is live;
 * Sportsbook has its place here so the page does not change shape when a
 * sportsbook provider is connected.
 */
const MyBetsView: FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const tab: Tab = router.query.tab === 'sportsbook' ? 'sportsbook' : 'casino';
  // A blank ?bet= opens nothing: there is no bet to load.
  const slipId =
    typeof router.query.bet === 'string' && router.query.bet !== '' ? router.query.bet : null;

  const [inputQuery, setInputQuery] = useState('');
  const [query, setQuery] = useState('');
  const [game, setGame] = useState('');
  const [sort, setSort] = useState<BetSort>('recent');
  const [page, setPage] = useState(1);

  const [bets, setBets] = useState<readonly BetRow[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [games, setGames] = useState<{ slug: string; title: string }[]>([]);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const debounce = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    debounce.current = setTimeout(() => {
      setQuery(inputQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounce.current);
  }, [inputQuery]);

  useEffect(() => {
    fetchBetGames()
      .then(setGames)
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    if (tab !== 'casino') return;
    let live = true;
    setLoading(true);
    setFailed(false);
    fetchBets({ query, page, pageSize: PAGE_SIZE, game, sort })
      .then((r) => {
        if (!live) return;
        setBets(r.bets);
        setTotalPages(r.totalPages);
        setLoading(false);
      })
      .catch(() => {
        if (!live) return;
        setBets([]);
        setTotalPages(0);
        setFailed(true);
        setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [tab, query, page, game, sort, attempt]);

  const setParams = useCallback(
    (next: Record<string, string | null>) => {
      const q = { ...router.query };
      for (const [k, v] of Object.entries(next)) {
        if (v === null) delete q[k];
        else q[k] = v;
      }
      void router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true });
    },
    [router],
  );

  const exportCsv = async () => {
    setExporting(true);
    setNotice(null);
    try {
      const r = await fetchBetsForExport({ query, game, sort });
      if (r.bets.length === 0) {
        setNotice({ kind: 'info', text: t('bets.exportEmpty') });
        return;
      }
      download(betsCsvFilename(new Date()), betsToCsv(r.bets));
      if (r.truncated) setNotice({ kind: 'info', text: t('bets.exportTruncated') });
    } catch {
      setNotice({ kind: 'error', text: t('bets.exportFailed') });
    } finally {
      setExporting(false);
    }
  };

  const gameOptions = useMemo(
    () => [
      { value: '', label: t('bets.allGames') },
      ...games.map((g) => ({ value: g.slug, label: g.title })),
    ],
    [games, t],
  );
  const sortOptions = useMemo(
    () => [
      { value: 'recent', label: t('bets.sortRecent') },
      { value: 'payout', label: t('bets.sortPayout') },
      { value: 'multiplier', label: t('bets.sortMultiplier') },
    ],
    [t],
  );

  const filtered = query !== '' || game !== '';

  return (
    <div className="mx-auto max-w-[1548px] px-1 lg:max-w-[calc(var(--u)*1548)] lg:px-0 lg:pt-[calc(var(--u)*24)]">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[24px] font-medium leading-8 text-[#f0f1f5] lg:text-[length:max(24px,calc(var(--u)*44))] lg:font-semibold lg:leading-[calc(var(--u)*52)]">
          {t('nav.myBets')}
        </h1>
        {tab === 'casino' && (
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={exporting || loading || failed}
            className="rl-chip flex h-[40px] shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-[#ffe779] disabled:cursor-not-allowed disabled:opacity-50 lg:h-[calc(var(--u)*40)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            {exporting ? t('bets.exporting') : t('bets.exportCsv')}
          </button>
        )}
      </div>

      <div className="mt-5 flex gap-[calc(var(--u)*11)] lg:mt-[calc(var(--u)*20)]" role="tablist">
        {(['casino', 'sportsbook'] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setNotice(null);
              setParams({ tab: key, bet: null });
            }}
            className={chip(tab === key)}
          >
            {t(key === 'casino' ? 'bets.casino' : 'bets.sportsbook')}
          </button>
        ))}
      </div>

      {notice && (
        <p
          role="status"
          className={`mt-4 rounded-xl px-4 py-3 text-[14px] ${
            notice.kind === 'error' ? 'bg-[#ef4444]/15 text-[#fca5a5]' : 'bg-white/5 text-[#cfd2dc]'
          }`}
        >
          {notice.text}
        </p>
      )}

      {tab === 'sportsbook' ? (
        <div className="mt-5 rounded-2xl bg-white/5 px-6 py-16 text-center lg:mt-[calc(var(--u)*20)]">
          <p className="text-[16px] font-medium text-white">{t('bets.sportsEmpty')}</p>
          <p className="mt-2 text-[14px] text-[#9da2b4]">{t('bets.sportsEmptyNote')}</p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-3 lg:mt-[calc(var(--u)*20)] lg:flex-row lg:items-center lg:gap-[calc(var(--u)*16)]">
            <label className="rl-chip flex h-[46px] min-w-0 flex-1 items-center gap-[calc(var(--u)*10)] ps-[calc(var(--u)*12)] pe-[calc(var(--u)*20)] lg:h-[calc(var(--u)*48)]">
              <SearchIcon size={24} strokeWidth={1.5} className="shrink-0 text-[#f0f1f5]" />
              <input
                type="search"
                value={inputQuery}
                placeholder={t('bets.search')}
                onChange={(e) => setInputQuery(e.target.value)}
                aria-label={t('bets.search')}
                className="min-w-0 flex-1 bg-transparent text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[1.5] text-[#f0f1f5] outline-none placeholder:text-[#9da2b4]"
              />
            </label>

            <FilterDropdown
              label={t('bets.gameLabel')}
              ariaLabel={t('tx.game')}
              value={game}
              options={gameOptions}
              searchPlaceholder={t('bets.searchGames')}
              emptyText={t('bets.noGames')}
              onChange={(v) => {
                setGame(v);
                setPage(1);
              }}
            />

            <FilterDropdown
              label={t('bets.sortLabel')}
              ariaLabel="Sort"
              value={sort}
              options={sortOptions}
              onChange={(v) => {
                setSort(v as BetSort);
                setPage(1);
              }}
            />
          </div>

          <div className={`mt-5 transition-opacity lg:mt-[calc(var(--u)*14)] ${loading ? 'opacity-60' : ''}`}>
            {failed ? (
              <div className="rounded-2xl bg-white/5 px-6 py-12 text-center">
                <p className="text-[14px] text-[#9da2b4]">{t('bets.loadFailed')}</p>
                <button
                  type="button"
                  onClick={() => setAttempt((n) => n + 1)}
                  className="mt-4 rounded-full bg-white/10 px-5 py-2 text-[14px] text-white hover:bg-white/15"
                >
                  {t('tx.retry')}
                </button>
              </div>
            ) : (
              <BetsTable
                rows={bets}
                onRowClick={(b) => setParams({ bet: b.id })}
                empty={filtered ? t('bets.noMatch') : t('tx.noBets')}
              />
            )}
          </div>

          <div className="mt-[34px] lg:mt-[calc(var(--u)*33)]">
            <TablePager page={Math.min(page, totalPages)} totalPages={totalPages} onPage={setPage} />
          </div>
        </>
      )}

      <BetSlipModal
        open={tab === 'casino' && slipId !== null}
        onClose={() => setParams({ bet: null })}
        betId={slipId}
      />
    </div>
  );
};

export default MyBetsView;
