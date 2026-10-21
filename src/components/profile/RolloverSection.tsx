import { useCallback, useEffect, useRef, useState, type FC, type ReactNode } from 'react';

import { useTranslation } from '@/context/I18nContext';
import { useCurrencyConversion } from '@/context/CurrencyConversionContext';
import { SECTION_HEADING } from '@/components/profile/SectionShell';
import RolloverTable from '@/components/profile/rollover/RolloverTable';
import RolloverDetailsModal from '@/components/profile/rollover/RolloverDetailsModal';
import BonusWageringTable from '@/components/profile/rollover/BonusWageringTable';
import TablePager from '@/components/profile/transactions/TablePager';
import { getBonusWagering, getRolloverHistory, getRolloverSummary } from '@/services/rollover';
import { ROLLOVER_PAGE_SIZE, ROLLOVER_STATUSES, ROLLOVER_STATUS_KEYS } from '@/constants/rollover';
import { BONUS_REFRESH_EVENT, WALLET_REFRESH_EVENT } from '@/constants/events';
import type {
  ApiError,
  BonusWagering,
  DepositRollover,
  DepositRolloverStatus,
  RolloverSummary,
  UserBonus,
} from '@/types';

type Tab = 'open' | 'history';
type StatusFilter = DepositRolloverStatus | 'ALL';

const Figure: FC<{ label: string; value: string; tone?: 'gold' | 'green' }> = ({
  label,
  value,
  tone,
}) => (
  <div className="rl-glass-deep rounded-[16px] px-4 py-3 lg:rounded-[calc(var(--u)*20)]">
    <p className="text-[11px] text-white/45 lg:text-[length:max(10px,calc(var(--u)*13))]">
      {label}
    </p>
    <p
      className={`mt-0.5 text-[16px] font-semibold lg:text-[length:max(12px,calc(var(--u)*20))] ${
        tone === 'gold' ? 'text-[#ffe779]' : tone === 'green' ? 'text-[#35d07f]' : 'text-[#f0f1f5]'
      }`}
    >
      {value}
    </p>
  </div>
);

const BonusWageringBlock: FC<{ rows: readonly UserBonus[]; locale: string }> = ({
  rows,
  locale,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-6">
      <h3 className="text-[15px] font-semibold text-[#f0f1f5] lg:text-[length:max(12px,calc(var(--u)*18))]">
        {t('roll.bonusTitle')}
      </h3>
      <p className="mt-1 text-[12px] leading-relaxed text-white/50 lg:text-[length:max(10px,calc(var(--u)*14))]">
        {t('roll.bonusBlurb')}
      </p>
      <div className="mt-3">
        <BonusWageringTable rows={rows} locale={locale} />
      </div>
    </div>
  );
};

const TAB_BUTTON =
  'h-[calc(var(--u)*40)] rounded-full px-4 text-[13px] font-medium transition-colors lg:px-[calc(var(--u)*20)] lg:text-[length:max(11px,calc(var(--u)*15))]';

const RolloverSection: FC = () => {
  const { t, locale } = useTranslation();
  const { formatCurrencyDisplay } = useCurrencyConversion();

  const tRef = useRef(t);
  tRef.current = t;

  const [summary, setSummary] = useState<RolloverSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('open');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);

  const [history, setHistory] = useState<readonly DepositRollover[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [selected, setSelected] = useState<DepositRollover | null>(null);

  const [bonusWagering, setBonusWagering] = useState<BonusWagering | null>(null);

  const summaryRequest = useRef(0);
  const historyRequest = useRef(0);
  const bonusRequest = useRef(0);

  const loadBonusWagering = useCallback(async (): Promise<void> => {
    const request = ++bonusRequest.current;
    const res = await getBonusWagering().catch(() => null);
    if (request === bonusRequest.current && res?.success && res.data) {
      setBonusWagering(res.data);
    }
  }, []);

  const loadSummary = useCallback(async (): Promise<void> => {
    const request = ++summaryRequest.current;
    setSummaryLoading(true);
    try {
      const res = await getRolloverSummary();
      if (request !== summaryRequest.current) return;
      if (res?.success && res.data) {
        setSummary(res.data);
        setSummaryError(null);
      } else {
        setSummaryError(res?.message || tRef.current('roll.loadFailed'));
      }
    } catch (err) {
      if (request !== summaryRequest.current) return;
      setSummaryError((err as ApiError)?.message || tRef.current('roll.loadFailed'));
    } finally {
      if (request === summaryRequest.current) {
        setSummaryLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadSummary();
    void loadBonusWagering();

    const onWalletChanged = (): void => {
      void loadSummary();
      void loadBonusWagering();
    };
    const onBonusChanged = (): void => void loadBonusWagering();
    window.addEventListener(WALLET_REFRESH_EVENT, onWalletChanged);
    window.addEventListener(BONUS_REFRESH_EVENT, onBonusChanged);
    return () => {
      window.removeEventListener(WALLET_REFRESH_EVENT, onWalletChanged);
      window.removeEventListener(BONUS_REFRESH_EVENT, onBonusChanged);
    };
  }, [loadSummary, loadBonusWagering]);

  const loadHistory = useCallback(async (): Promise<void> => {
    const request = ++historyRequest.current;
    setHistoryLoading(true);
    try {
      const res = await getRolloverHistory({
        page,
        limit: ROLLOVER_PAGE_SIZE,
        ...(status !== 'ALL' && { status }),
      });
      if (request !== historyRequest.current) return;
      if (res?.success && res.data) {
        setHistory(res.data.data);
        setTotalPages(Math.max(1, res.data.pagination.totalPages));
        setHistoryError(null);
      } else {
        setHistoryError(res?.message || tRef.current('roll.loadFailed'));
      }
    } catch (err) {
      if (request !== historyRequest.current) return;
      setHistoryError((err as ApiError)?.message || tRef.current('roll.loadFailed'));
    } finally {
      if (request === historyRequest.current) {
        setHistoryLoading(false);
      }
    }
  }, [page, status]);

  useEffect(() => {
    if (tab === 'history') {
      void loadHistory();
    }
  }, [tab, loadHistory]);

  const activeBonuses = bonusWagering?.active ?? [];
  const finishedBonuses = bonusWagering?.history ?? [];
  const outstandingCount = (summary?.open_count ?? 0) + activeBonuses.length;

  const selectStatus = (next: StatusFilter): void => {
    setStatus(next);
    setPage(1);
  };

  const banner = (): ReactNode => {
    if (!summary) {
      return null;
    }

    if (summary.open_count > 0 && summary.blocks_withdrawal) {
      const unlocked = Number(summary.withdrawable) > 0;
      return (
        <div
          className={`rounded-[16px] px-4 py-3 lg:rounded-[calc(var(--u)*20)] ${
            unlocked
              ? 'border border-[#35d07f]/25 bg-[#35d07f]/[0.07]'
              : 'border border-[#f9d028]/25 bg-[#f9d028]/[0.07]'
          }`}
        >
          <p
            className={`text-[14px] font-semibold ${unlocked ? 'text-[#35d07f]' : 'text-[#ffe779]'}`}
          >
            {unlocked
              ? t('roll.partial', { amount: formatCurrencyDisplay(summary.withdrawable) })
              : t('roll.heldAll')}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/64">
            {unlocked
              ? t('roll.partialBody', {
                  remaining: formatCurrencyDisplay(summary.total_remaining),
                })
              : t('roll.heldAllBody', {
                  remaining: formatCurrencyDisplay(summary.total_remaining),
                })}
          </p>
        </div>
      );
    }

    if (summary.open_count > 0) {
      return (
        <div className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 lg:rounded-[calc(var(--u)*20)]">
          <p className="text-[13px] leading-relaxed text-white/72">{t('roll.trackingOnly')}</p>
        </div>
      );
    }

    return (
      <div className="rounded-[16px] border border-[#35d07f]/25 bg-[#35d07f]/[0.07] px-4 py-3 lg:rounded-[calc(var(--u)*20)]">
        <p className="text-[14px] font-semibold text-[#35d07f]">{t('roll.clear')}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-white/64">{t('roll.clearBody')}</p>
      </div>
    );
  };

  return (
    <div>
      <h2 className={SECTION_HEADING}>{t('roll.title')}</h2>
      <p className="mt-2 max-w-[640px] text-[13px] leading-relaxed text-white/50 lg:text-[length:max(11px,calc(var(--u)*15))]">
        {t('roll.blurb')}
      </p>

      {summaryError && !summaryLoading && !summary ? (
        <div className="mt-5 py-10 text-center">
          <p className="text-[13px] text-white/60">{summaryError}</p>
          <button
            type="button"
            onClick={() => void loadSummary()}
            className="rl-btn-gold mt-3 rounded-full px-4 py-2 text-xs font-semibold"
          >
            {t('roll.retry')}
          </button>
        </div>
      ) : !summary ? (
        <p className="mt-5 text-[13px] text-white/40">{t('common.loading')}</p>
      ) : (
        <>
          <div className="mt-5">{banner()}</div>

          {summary.open_count > 0 && (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
                <Figure
                  label={t('roll.totalRequired')}
                  value={formatCurrencyDisplay(summary.total_required)}
                />
                <Figure
                  label={t('roll.totalCompleted')}
                  value={formatCurrencyDisplay(summary.total_completed)}
                  tone="green"
                />
                <Figure
                  label={t('roll.totalRemaining')}
                  value={formatCurrencyDisplay(summary.total_remaining)}
                  tone="gold"
                />
                <Figure label={t('roll.openCount')} value={String(summary.open_count)} />
                <Figure label={t('roll.locked')} value={formatCurrencyDisplay(summary.locked)} />
                <Figure
                  label={t('roll.withdrawable')}
                  value={formatCurrencyDisplay(summary.withdrawable)}
                  tone="green"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-semibold tracking-wide text-white/40 uppercase">
                    {t('roll.overall')}
                  </span>
                  <span className="text-[11px] text-white/64">{summary.progress}%</span>
                </div>
                <div
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-valuenow={summary.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={t('roll.overall')}
                >
                  <div
                    className="h-full rounded-full bg-[#f9d028] transition-[width] duration-500"
                    style={{ width: `${summary.progress}%` }}
                  />
                </div>
              </div>
            </>
          )}

          {!summary.enabled && (
            <p className="mt-4 text-[12px] text-white/40">{t('roll.disabled')}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('open')}
              aria-pressed={tab === 'open'}
              className={`${TAB_BUTTON} ${
                tab === 'open'
                  ? 'bg-[#ffe779] text-[#15161c]'
                  : 'bg-white/7 text-white/64 hover:bg-white/10'
              }`}
            >
              {t('roll.open')}
              {outstandingCount > 0 && ` (${outstandingCount})`}
            </button>
            <button
              type="button"
              onClick={() => setTab('history')}
              aria-pressed={tab === 'history'}
              className={`${TAB_BUTTON} ${
                tab === 'history'
                  ? 'bg-[#ffe779] text-[#15161c]'
                  : 'bg-white/7 text-white/64 hover:bg-white/10'
              }`}
            >
              {t('roll.history')}
            </button>
          </div>

          {tab === 'open' ? (
            <>
              {(summary.open.length > 0 || activeBonuses.length === 0) && (
                <div className="mt-4">
                  <RolloverTable
                    rows={summary.open}
                    locale={locale}
                    empty={summary.open_count === 0 ? t('roll.emptyOpen') : t('roll.empty')}
                    onOpen={setSelected}
                  />
                </div>
              )}
              {activeBonuses.length > 0 && (
                <BonusWageringBlock rows={activeBonuses} locale={locale} />
              )}
            </>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectStatus('ALL')}
                  aria-pressed={status === 'ALL'}
                  className={`${TAB_BUTTON} ${
                    status === 'ALL'
                      ? 'bg-white/15 text-[#f0f1f5]'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {t('roll.filterAll')}
                </button>
                {ROLLOVER_STATUSES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectStatus(option)}
                    aria-pressed={status === option}
                    className={`${TAB_BUTTON} ${
                      status === option
                        ? 'bg-white/15 text-[#f0f1f5]'
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {t(ROLLOVER_STATUS_KEYS[option])}
                  </button>
                ))}
              </div>

              {historyError ? (
                <div className="mt-4 py-10 text-center">
                  <p className="text-[13px] text-white/60">{historyError}</p>
                  <button
                    type="button"
                    onClick={() => void loadHistory()}
                    className="rl-btn-gold mt-3 rounded-full px-4 py-2 text-xs font-semibold"
                  >
                    {t('roll.retry')}
                  </button>
                </div>
              ) : (
                <>
                  <div className={`mt-4 transition-opacity ${historyLoading ? 'opacity-60' : ''}`}>
                    <RolloverTable
                      rows={history}
                      locale={locale}
                      empty={historyLoading ? t('common.loading') : t('roll.empty')}
                      onOpen={setSelected}
                    />
                  </div>

                  <div className="mt-6">
                    <TablePager
                      page={Math.min(page, totalPages)}
                      totalPages={totalPages}
                      onPage={setPage}
                    />
                  </div>
                </>
              )}

              {finishedBonuses.length > 0 && (
                <BonusWageringBlock rows={finishedBonuses} locale={locale} />
              )}
            </>
          )}
        </>
      )}

      {selected && (
        <RolloverDetailsModal
          rollover={selected}
          locale={locale}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default RolloverSection;
