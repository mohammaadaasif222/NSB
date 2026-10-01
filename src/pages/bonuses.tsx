import { useState, type FC, type FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import PlayerLayout from '@/layout/PlayerLayout';
import ButtonLoader from '@/components/ButtonLoader';
import BonusOfferCard from '@/components/bonus/BonusOfferCard';
import ActiveBonusCard from '@/components/bonus/ActiveBonusCard';
import { TicketIcon } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useBonuses } from '@/hooks/useBonuses';
import {
  BONUS_DESCRIPTION_KEYS,
  BONUS_STATUS_KEYS,
  BONUS_TITLE_KEYS,
  BONUS_TYPES,
} from '@/constants/bonus';
import { formatRewardAmount } from '@/utils/money';
import type { UserBonusStatus } from '@/types';

const STATUS_STYLE: Record<UserBonusStatus, string> = {
  ACTIVE: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  COMPLETED: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  EXPIRED: 'bg-slate-800 border-slate-700 text-slate-300',
  FORFEITED: 'bg-red-500/10 border-red-500/30 text-red-300',
};

/** What each bonus flow is — shown to a visitor who is not signed in. */
const BonusExplainer: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {BONUS_TYPES.map((type) => (
        <article key={type} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-300"
            aria-hidden="true"
          >
            <TicketIcon size={20} />
          </span>
          <h3 className="mt-3 text-base font-bold text-white">{t(BONUS_TITLE_KEYS[type])}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {t(BONUS_DESCRIPTION_KEYS[type])}
          </p>
        </article>
      ))}
    </div>
  );
};

/**
 * Deposit match, free spins, bonus cash and the rest.
 *
 * Public: a signed-out visitor sees what the bonuses are and a way to sign in.
 * A player sees what they can claim, what they are working through, and what
 * they have finished. Bonuses switched off in the console are left out —
 * except awards already running, which a player must still be able to finish.
 */
const BonusesPage: FC = () => {
  const { token, hydrated } = useAuth();
  const { t, locale } = useTranslation();
  const { summary, error, busyId, refresh, claim, forfeit } = useBonuses();

  const [code, setCode] = useState('');

  const clockOffset = summary ? new Date(summary.server_time).getTime() - Date.now() : 0;

  const redeem = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const couponCode = code.trim().toUpperCase();
    if (!couponCode) {
      return;
    }
    const result = await claim({ couponCode });
    if (result) {
      setCode('');
    }
  };

  const playerView = (): React.ReactNode => {
    if (!summary) {
      return (
        <section className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
          {error ? (
            <>
              <p className="text-sm text-slate-400">{t('bonus.loadFailed')}</p>
              <button
                type="button"
                onClick={() => void refresh()}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
              >
                {t('bonus.retry')}
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">{t('common.loading')}</p>
          )}
        </section>
      );
    }

    return (
      <>
        {/* Redeem a code. First, because a player arriving with one has come
            here to type it and should not have to scroll past the offers. */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
          <h2 className="text-sm font-bold text-white">{t('bonus.haveACode')}</h2>
          <p className="mt-1 text-xs text-slate-400">{t('bonus.haveACodeHint')}</p>
          <form onSubmit={redeem} className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('bonus.codePlaceholder')}
              aria-label={t('bonus.haveACode')}
              className="h-10 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-sm font-medium tracking-wide text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busyId !== null || !code.trim()}
              className="flex h-10 items-center justify-center rounded-xl bg-blue-600 px-5 text-xs font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busyId === code.trim().toUpperCase() ? <ButtonLoader /> : t('bonus.redeem')}
            </button>
          </form>
        </section>

        {!summary.enabled && (
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-xs text-amber-200">{t('bonus.switchedOff')}</p>
          </section>
        )}

        {/* Active awards */}
        {summary.active.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold text-white">{t('bonus.yourBonuses')}</h2>
              <span className="text-xs text-slate-500">
                {t('bonus.slotsRemaining', { count: summary.slots_remaining })}
              </span>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summary.active.map((award) => (
                <ActiveBonusCard
                  key={award.id}
                  award={award}
                  currency={summary.currency}
                  clockOffset={clockOffset}
                  busyId={busyId}
                  onForfeit={(id) => void forfeit(id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* On offer */}
        <section>
          <h2 className="text-lg font-bold text-white">{t('bonus.available')}</h2>
          {summary.available.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-10 text-center text-sm text-slate-500">
              {t('bonus.noneAvailable')}
            </p>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summary.available.map((bonus) => (
                <BonusOfferCard
                  key={bonus.id}
                  bonus={bonus}
                  currency={summary.currency}
                  busyId={busyId}
                  onClaim={(id) => void claim({ bonusId: id })}
                />
              ))}
            </div>
          )}
        </section>

        {/* History */}
        {summary.history.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white">{t('bonus.history')}</h2>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {t('bonus.table.bonus')}
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {t('bonus.table.amount')}
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {t('bonus.table.status')}
                    </th>
                    <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {t('bonus.table.finished')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.history.map((award) => (
                    <tr key={award.id} className="border-b border-slate-800/60 last:border-0">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-medium text-white">{award.bonus.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {t(BONUS_TITLE_KEYS[award.bonus.type])}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-300">
                        {formatRewardAmount(award.bonus_amount, summary.currency)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            STATUS_STYLE[award.status]
                          }`}
                        >
                          {t(BONUS_STATUS_KEYS[award.status])}
                        </span>
                        {award.forfeit_reason && (
                          <p
                            className="mt-0.5 max-w-[200px] truncate text-[10px] text-slate-500"
                            title={award.forfeit_reason}
                          >
                            {award.forfeit_reason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-slate-500">
                        {new Date(award.ended_at ?? award.updated_at).toLocaleDateString(locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </>
    );
  };

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('bonus.title')} · ROLLUCK`}</title>
      </Head>

      <div className="mx-auto max-w-[1600px] space-y-6 pb-2">
        <header>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t('bonus.title')}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{t('bonus.subtitle')}</p>
          {token && summary && (
            <p className="mt-1 max-w-2xl text-xs text-slate-500">
              {t('bonus.paidTo', {
                currency: summary.payout.currency_code,
                network: summary.payout.network_code,
              })}
            </p>
          )}
        </header>

        {/* Nothing until the token is restored, or a signed-in player would see
            the visitor view flash first. */}
        {hydrated &&
          (token ? (
            playerView()
          ) : (
            <>
              <section className="flex flex-col items-start gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="text-sm text-slate-300">{t('bonus.loginPrompt')}</p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    className="inline-flex h-10 items-center rounded-xl border border-slate-700 bg-slate-800 px-4 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                  >
                    {t('account.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    {t('account.register')}
                  </Link>
                </div>
              </section>
              <BonusExplainer />
            </>
          ))}
      </div>
    </PlayerLayout>
  );
};

export default BonusesPage;
