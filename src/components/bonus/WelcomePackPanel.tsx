import type { FC } from 'react';

import ButtonLoader from '@/components/ButtonLoader';
import { useAuthModal } from '@/context/AuthModalContext';
import { useTranslation } from '@/context/I18nContext';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { formatRewardAmount } from '@/utils/money';
import type { TranslationKey } from '@/i18n/locales';
import type { WelcomeStage, WelcomeStageReasonCode, WelcomeStageStatus } from '@/types';

const STAGE_LABEL_KEYS: Record<number, TranslationKey> = {
  1: 'bonus.deposit1',
  2: 'bonus.deposit2',
  3: 'bonus.deposit3',
};

const STAGE_STATUS_KEYS: Record<WelcomeStageStatus, TranslationKey> = {
  UNAVAILABLE: 'bonus.unavailable',
  LOCKED: 'bonus.locked',
  AVAILABLE: 'bonus.claim',
  CLAIMED: 'bonus.status.active',
  COMPLETED: 'bonus.status.completed',
  EXPIRED: 'bonus.status.expired',
  FORFEITED: 'bonus.status.forfeited',
};

const REASON_KEYS: Partial<Record<WelcomeStageReasonCode, TranslationKey>> = {
  NOT_STARTED: 'bonus.reason.notStarted',
  ENDED: 'bonus.reason.ended',
  OUT_OF_STOCK: 'bonus.reason.outOfStock',
  DEPOSIT_UNVALUED: 'bonus.reason.depositUnvalued',
  DEPOSIT_USED: 'bonus.reason.depositUsed',
  DEPOSIT_BELOW_MIN: 'bonus.reason.depositBelowMin',
  DEPOSIT_ABOVE_MAX: 'bonus.reason.depositAboveMax',
  WINDOW_CLOSED: 'bonus.reason.windowClosed',
  CLAIM_PREVIOUS: 'bonus.reason.claimPrevious',
  WAGER_PREVIOUS: 'bonus.reason.wagerPrevious',
  AT_LIMIT: 'bonus.reason.atLimit',
};

const PILL =
  'mt-4 flex h-12 w-full items-center justify-center rounded-full px-3 text-center text-[15px] font-medium leading-5 lg:mt-[calc(var(--u)*16)] lg:h-[calc(var(--u)*56)] lg:text-[length:max(12px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]';

interface StageCardProps {
  stage: WelcomeStage;
  currency: string;
  signedIn: boolean;
  clockOffset: number;
  busyId: string | null;
  onClaim: (bonusId: string) => void;
  onForfeit: (awardId: string) => void;
  onDeposit: () => void;
}

const StageCard: FC<StageCardProps> = ({
  stage,
  currency,
  signedIn,
  clockOffset,
  busyId,
  onClaim,
  onForfeit,
  onDeposit,
}) => {
  const { t } = useTranslation();
  const { openRegister } = useAuthModal();

  const running = stage.status === 'CLAIMED' ? stage.award : null;
  const open = stage.status === 'AVAILABLE' || stage.status === 'LOCKED';
  const countdown = useCountdown(
    open ? stage.claim_until : (running?.expires_at ?? null),
    clockOffset
  );

  const labelKey = STAGE_LABEL_KEYS[stage.sequence];
  const label = labelKey ? t(labelKey) : stage.label;

  const headline =
    stage.match_percentage !== null
      ? `${stage.match_percentage}%`
      : stage.estimated_amount && Number(stage.estimated_amount) > 0
        ? formatRewardAmount(stage.estimated_amount, currency)
        : stage.free_spins_count
          ? t('bonus.spinsCount', { count: stage.free_spins_count })
          : '—';

  const terms = [
    Number(stage.min_deposit_amount ?? 0) > 0
      ? t('bonus.minDeposit', {
          amount: formatRewardAmount(stage.min_deposit_amount as string, currency),
        })
      : null,
    Number(stage.max_bonus_amount ?? 0) > 0
      ? t('bonus.upTo', {
          amount: formatRewardAmount(stage.max_bonus_amount as string, currency),
        })
      : null,
    stage.free_spins_count && stage.match_percentage !== null
      ? t('bonus.spinsCount', { count: stage.free_spins_count })
      : null,
    Number(stage.wagering_multiplier ?? 0) > 0
      ? t('bonus.terms.wagering', { multiplier: Number(stage.wagering_multiplier) })
      : null,
  ].filter((line): line is string => !!line);

  const reasonKey = stage.reason_code ? REASON_KEYS[stage.reason_code] : undefined;
  const params = stage.reason_params;
  const previousKey = params?.stage_sequence ? STAGE_LABEL_KEYS[params.stage_sequence] : undefined;

  const reason = reasonKey
    ? t(reasonKey, {
        amount: params?.amount ? formatRewardAmount(params.amount, currency) : '',
        minimum: params?.minimum ? formatRewardAmount(params.minimum, currency) : '',
        maximum: params?.maximum ? formatRewardAmount(params.maximum, currency) : '',
        stage: previousKey ? t(previousKey) : '',
        count: params?.count ?? 0,
      })
    : stage.reason;

  const hasRequirement = !!stage.award && Number(stage.award.wagering_required) > 0;
  const award = stage.award;
  const busy = !!stage.bonus_id && busyId === stage.bonus_id;

  const action = (): JSX.Element => {
    if (!signedIn) {
      return (
        <button
          type="button"
          onClick={() => openRegister()}
          className={`rl-btn-ghost ${PILL} font-medium`}
        >
          {t('bonus.signUpToClaim')}
        </button>
      );
    }

    if (stage.claimable && stage.bonus_id) {
      const bonusId = stage.bonus_id;
      return (
        <button
          type="button"
          onClick={() => onClaim(bonusId)}
          disabled={busyId !== null}
          className={`rl-btn-gold ${PILL} font-semibold disabled:cursor-not-allowed`}
        >
          {busy ? <ButtonLoader /> : t('bonus.claim')}
        </button>
      );
    }

    if (stage.needs_deposit) {
      return (
        <button type="button" onClick={onDeposit} className={`rl-btn-ghost ${PILL} font-medium`}>
          {t('bonus.needsDeposit')}
        </button>
      );
    }

    return (
      <p className={`${PILL} bg-white/10 text-[#f0f1f5]`}>{t(STAGE_STATUS_KEYS[stage.status])}</p>
    );
  };

  return (
    <li className="rl-liquid flex flex-col rounded-[24px] px-5 pb-5 pt-6 text-center lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*24)] lg:pb-[calc(var(--u)*21)] lg:pt-[calc(var(--u)*24)]">
      <p className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(20px,calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
        {headline}
      </p>
      <p className="mt-3 text-[13px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*16)] lg:text-[length:max(10px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
        {label}
      </p>

      {terms.length > 0 && (
        <p className="mt-1.5 text-[12px] leading-4 text-white/48 lg:text-[length:max(10px,calc(var(--u)*13))]">
          {terms.join(' · ')}
        </p>
      )}

      {hasRequirement && award && (
        <div className="mt-3 text-left">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
              {t('bonus.wageringProgress')}
            </span>
            <span className="text-[10px] text-white/64">
              {formatRewardAmount(award.wagering_completed, currency)} /{' '}
              {formatRewardAmount(award.wagering_required, currency)}
            </span>
          </div>
          <div
            className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={award.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('bonus.wageringProgress')}
          >
            <div
              className="h-full rounded-full bg-[#f9d028] transition-[width] duration-500"
              style={{ width: `${award.progress}%` }}
            />
          </div>
        </div>
      )}

      {reason && !stage.claimable && !stage.needs_deposit && (
        <p className="mt-2 text-[12px] leading-4 text-white/56">{reason}</p>
      )}

      {countdown !== null && (
        <p className="mt-2 text-[12px] leading-4 text-[#f9d028]">
          {running
            ? `${t('bonus.expiresIn')} ${formatCountdown(countdown)}`
            : t('bonus.claimWithin', { time: formatCountdown(countdown) })}
        </p>
      )}

      <div className="mt-auto">{action()}</div>

      {running && (
        <button
          type="button"
          onClick={() => onForfeit(running.id)}
          disabled={busyId !== null}
          className="mt-2 text-[11px] leading-4 text-white/48 underline decoration-white/24 transition-colors hover:text-[#ef4462] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busyId === running.id ? <ButtonLoader /> : t('bonus.forfeit')}
        </button>
      )}
    </li>
  );
};

interface Props {
  stages: WelcomeStage[];
  currency: string;
  enabled: boolean;
  pending: boolean;
  failed: boolean;
  signedIn: boolean;
  clockOffset: number;
  busyId: string | null;
  onClaim: (bonusId: string) => void;
  onForfeit: (awardId: string) => void;
  onDeposit: () => void;
}

const WelcomePackPanel: FC<Props> = ({
  stages,
  currency,
  enabled,
  pending,
  failed,
  signedIn,
  clockOffset,
  busyId,
  onClaim,
  onForfeit,
  onDeposit,
}) => {
  const { t } = useTranslation();

  return (
    <section className="rl-glass-deep max-lg:rl-glass-clear rounded-[24px] px-5 pb-6 pt-7 lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*33)] lg:pb-[calc(var(--u)*26)] lg:pt-[calc(var(--u)*32)]">
      <h1 className="text-center text-[24px] font-semibold leading-8 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(16px,calc(var(--u)*32))] lg:leading-[calc(var(--u)*40)]">
        {t('bonus.welcomeTitle')}
      </h1>
      <p className="mt-2 text-center text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*8)] lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
        {t('bonus.welcomeSubtitle')}
      </p>

      {stages.length === 0 ? (
        <p className="mt-6 text-center text-[14px] leading-5 text-white/56 lg:mt-[calc(var(--u)*24)]">
          {pending
            ? t('common.loading')
            : failed
              ? t('bonus.loadFailed')
              : enabled
                ? t('bonus.welcomeEmpty')
                : t('bonus.welcomeOff')}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-3 lg:mt-[calc(var(--u)*24)] lg:gap-[calc(var(--u)*20)]">
          {stages.map((stage) => (
            <StageCard
              key={stage.sequence}
              stage={stage}
              currency={currency}
              signedIn={signedIn}
              clockOffset={clockOffset}
              busyId={busyId}
              onClaim={onClaim}
              onForfeit={onForfeit}
              onDeposit={onDeposit}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default WelcomePackPanel;
