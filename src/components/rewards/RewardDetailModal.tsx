import { useId, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/context/I18nContext';
import { useModalA11y } from '@/hooks/useModalA11y';
import { CloseIcon, REWARD_ICONS } from '@/components/icons';
import { REWARD_DEFAULT_SPLIT, REWARD_DETAILS, REWARD_TITLE_KEYS } from '@/constants/rewards';
import { formatRewardAmount } from '@/utils/money';
import type { RewardType, RewardTypeSummary } from '@/types';
import { ICON_WELL, LABEL, MUTED, PILL } from './rewardStyles';

interface Props {
  type: RewardType;
  /**
   * The player's own figures. Absent for a signed-out visitor, who gets the
   * standing copy and the default split but no rate pill or claimed total —
   * there is no account for those to be about.
   */
  summary?: RewardTypeSummary;
  currency?: string;
  onClose: () => void;
}

/** A headed block. Rendered only when it has something under it. */
const Section: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <section>
    <h3 className={`${LABEL} uppercase tracking-[0.08em]`}>{title}</h3>
    <div className="mt-1.5">{children}</div>
  </section>
);

/** A bulleted list of copy lines. */
const Lines: FC<{ items: string[] }> = ({ items }) => (
  <ul className={`space-y-1 ${MUTED}`}>
    {items.map((line) => (
      <li key={line} className="flex gap-2">
        <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#9da2b4]" />
        <span>{line}</span>
      </li>
    ))}
  </ul>
);

/**
 * Everything about one reward: what it is, how often it settles, how a claim
 * is paid out, what it is worked out from, what a VIP gets extra, and the
 * steps to claim it.
 *
 * A dialog rather than the panel this replaces. The copy runs to five or six
 * sections — far past what fits over a card in a horizontal scroller, which
 * clips anything reaching past the card's own edge — so it portals to <body>
 * and scrolls its own body on a short screen.
 *
 * The payout lines come from `reward.split`, the live per-tier percentages the
 * API reports, not from the standing copy: a retuned tier changes what a claim
 * actually pays, and a frozen "50% / 25% / 25%" would quietly start lying.
 */
const RewardDetailModal: FC<Props> = ({ type, summary, currency, onClose }) => {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useModalA11y(onClose);
  const detail = REWARD_DETAILS[type];
  const Icon = REWARD_ICONS[type];

  // The player's live split where there is one, the documented default where
  // there is not. WEEKLY and MONTHLY have neither — they land whole.
  const split = summary?.split ?? REWARD_DEFAULT_SPLIT[type];
  const payout: string[] = split
    ? [
        t('rewards.detail.payoutBalance', { percent: split.instant }),
        ...(split.weekly ? [t('rewards.detail.payoutWeekly', { percent: split.weekly })] : []),
        ...(split.monthly ? [t('rewards.detail.payoutMonthly', { percent: split.monthly })] : []),
      ]
    : [t('rewards.detail.payoutFull')];

  // Only ever opened by a click, so this is a client render; the guard keeps a
  // server render from reaching for `document`.
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="rl-modal-glass flex max-h-[92vh] w-full max-w-[520px] flex-col p-5 outline-none sm:p-7"
      >
        <div className="flex shrink-0 items-start gap-3">
          <span className={ICON_WELL(false)} aria-hidden="true">
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-[20px] leading-7 font-semibold text-[#f0f1f5] sm:text-[24px] sm:leading-8"
            >
              {t(REWARD_TITLE_KEYS[type])}
            </h2>
            <p className={`mt-0.5 ${LABEL}`}>{t(detail.subtitleKey)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rl-chip flex h-10 w-10 shrink-0 items-center justify-center text-[#f0f1f5]"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* `min-h-0` is what lets this shrink and scroll instead of growing and
            pushing the dialog off a short screen. */}
        <div className="thin-scrollbar mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto">
          <p className="text-[15px] leading-6 text-[#f0f1f5]">{t(detail.descriptionKey)}</p>

          {summary?.rate_percentage != null && (
            <span className={PILL}>{t('rewards.rate', { percent: summary.rate_percentage })}</span>
          )}

          <Section title={t('rewards.detail.frequency')}>
            <p className={MUTED}>{t(detail.frequencyKey)}</p>
          </Section>

          <Section title={t('rewards.detail.payout')}>
            <Lines items={payout} />
          </Section>

          <Section title={t('rewards.detail.calculatedFor')}>
            <Lines items={detail.calculatedForKeys.map((key) => t(key))} />
          </Section>

          {detail.vipKeys.length > 0 && (
            <Section title={t('rewards.detail.vip')}>
              <Lines items={detail.vipKeys.map((key) => t(key))} />
            </Section>
          )}

          {detail.boost && (
            <Section title={t(detail.boost.titleKey)}>
              <p className={MUTED}>{t(detail.boost.descriptionKey)}</p>
              <p className={`mt-1 ${LABEL}`}>
                {t('rewards.detail.boostDuration')}: {t(detail.boost.durationKey)}
              </p>
            </Section>
          )}

          {detail.activationKeys.length > 0 && (
            <Section title={t('rewards.detail.activation')}>
              <ol className={`space-y-1 ${MUTED}`}>
                {detail.activationKeys.map((key, index) => (
                  <li key={key} className="flex gap-2">
                    <span className="shrink-0 tabular-nums text-[#f0f1f5]">{index + 1}.</span>
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        {summary && currency && (
          <p
            className={`mt-5 flex shrink-0 items-center justify-between gap-2 border-t border-white/[0.08] pt-4 tabular-nums ${LABEL}`}
          >
            <span>{t('rewards.claimedTotal')}</span>
            <span className="text-[#f0f1f5]">
              {formatRewardAmount(summary.claimed_total, currency)}
            </span>
          </p>
        )}
      </div>
    </div>,
    document.body
  );
};

export default RewardDetailModal;
