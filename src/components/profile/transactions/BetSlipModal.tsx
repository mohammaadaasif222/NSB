import { useEffect, useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import GlassDialog from '@/components/ui/GlassDialog';
import type { TranslationKey } from '@/i18n/locales';
import { fetchBetSlip, type BetSlip } from './mockTransactions';
import { formatUsd, shortId } from './bets.rules';

interface Props {
  open: boolean;
  onClose: () => void;
  betId: string | null;
}

const EVENT_LABEL: Record<string, TranslationKey> = {
  BET: 'tx.eventBet',
  WIN: 'tx.eventWin',
  BET_WIN: 'tx.eventBetWin',
  END_ROUND: 'tx.eventEndRound',
  ROLLBACK: 'tx.eventRollback',
};

/** One round, laid out as a bet slip: the stake, what it paid, and every movement in it. */
const BetSlipModal: FC<Props> = ({ open, onClose, betId }) => {
  const { t, locale } = useTranslation();
  const [slip, setSlip] = useState<BetSlip | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !betId) return;
    let live = true;
    setSlip(null);
    setCopied(false);
    setState('loading');
    fetchBetSlip(betId)
      .then((s) => {
        if (!live) return;
        setSlip(s);
        setState('ready');
      })
      .catch(() => live && setState('error'));
    return () => {
      live = false;
    };
  }, [open, betId, attempt]);

  const money = (usd: string | number, signed = false): string => formatUsd(usd, signed);

  const when = (iso: string): string =>
    new Date(iso).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const net = slip ? parseFloat(slip.payout_usd) - parseFloat(slip.bet_usd) : 0;
  const netColor = net === 0 ? 'text-[#8c8c8c]' : net > 0 ? 'text-[#4ade80]' : 'text-[#ef4444]';

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      titleId="bet-slip-modal-title"
      title={t('tx.betSlip')}
      titleVariant="title"
      className="max-w-[600px] px-4 pb-8 pt-4 sm:px-[27px] sm:pb-[35px] sm:pt-[19px]"
    >
      {state !== 'ready' || !slip ? (
        <div className="py-16 text-center text-base text-[#8c8c8c]">
          <p>{state === 'error' ? t('tx.betLoadFailed') : t('tx.loading')}</p>
          {state === 'error' && (
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="mt-4 rounded-full bg-white/10 px-5 py-2 text-sm text-white hover:bg-white/15"
            >
              {t('tx.retry')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6 pt-6 sm:pt-[31px]">
          <div className="flex items-center gap-4">
            {slip.game_image && (
              <img
                src={slip.game_image}
                alt=""
                className="h-[84px] w-[84px] shrink-0 rounded-xl object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="truncate text-xl font-semibold text-white">{slip.game_title || '—'}</div>
              {slip.game_provider && (
                <div className="truncate text-base text-[#8c8c8c]">{slip.game_provider}</div>
              )}
              <div className="mt-1 text-sm text-[#8c8c8c]">
                {t('tx.placedOn')} {when(slip.created_at)}
              </div>
              {slip.status === 'BET_PLACED' && (
                <span className="mt-2 inline-flex rounded-full bg-[#eab308]/20 px-3 py-1 text-xs text-[#eab308]">
                  {t('tx.roundInProgress')}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-2xl bg-white/5 text-center">
            {[
              { label: t('tx.stake'), value: money(slip.bet_usd) },
              { label: t('tx.multiplier'), value: slip.multiplier ? `${slip.multiplier}x` : '—' },
              { label: t('tx.payout'), value: money(slip.payout_usd) },
            ].map((cell) => (
              <div key={cell.label} className="px-2 py-4">
                <div className="text-sm text-[#8c8c8c]">{cell.label}</div>
                <div className="mt-1 text-base font-semibold tabular-nums text-white sm:text-lg">
                  {cell.value}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-[#404040] pt-5">
            <Row label={t('tx.netResult')}>
              <span className={`font-semibold tabular-nums ${netColor}`}>{money(net, true)}</span>
            </Row>
            <Row label={t('tx.betId')}>
              <span className="font-mono text-sm text-white" title={slip.id}>
                {shortId(slip.id)}
              </span>
              <button
                type="button"
                data-sound="transactionidClick"
                onClick={() => {
                  void navigator.clipboard?.writeText(slip.id).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  });
                }}
                className="ms-3 text-sm text-[#4ade80] hover:underline"
                aria-live="polite"
              >
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </Row>
            {slip.provider_round_id && (
              <Row label={t('tx.providerRoundId')}>
                <span className="break-all font-mono text-sm text-white">{slip.provider_round_id}</span>
              </Row>
            )}
          </div>

          <div className="border-t border-[#404040] pt-5">
            <div className="mb-3 text-base text-[#8c8c8c]">{t('tx.activity')}</div>
            <ul className="space-y-2">
              {slip.events.map((e) => {
                const amount = parseFloat(e.win_usd) > 0 ? parseFloat(e.win_usd) : -parseFloat(e.bet_usd);
                return (
                  <li
                    key={e.id}
                    className={`flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm ${
                      e.rolled_back ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    <span className="text-white">{t(EVENT_LABEL[e.type] ?? 'tx.eventBet')}</span>
                    <span className="text-[#8c8c8c]">{when(e.created_at)}</span>
                    <span
                      className={`tabular-nums ${
                        amount > 0 ? 'text-[#4ade80]' : amount < 0 ? 'text-[#ef4444]' : 'text-[#8c8c8c]'
                      }`}
                    >
                      {amount === 0 ? money(0) : money(amount, true)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </GlassDialog>
  );
};

const Row: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="shrink-0 text-base text-[#8c8c8c]">{label}</span>
    <span className="flex items-center text-end text-base">{children}</span>
  </div>
);

export default BetSlipModal;
