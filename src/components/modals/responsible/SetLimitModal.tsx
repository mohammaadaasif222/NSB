import { useEffect, useState, type FC, type ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { DISPLAY_CURRENCY_SYMBOL, LIMIT_DEFINITIONS } from '@/components/responsible/rgContent';
import type { LimitKind, LimitPeriod, LimitSet } from '@/types/responsible';
import type { TranslationKey } from '@/i18n/locales';
import { CloseIcon } from '@/components/icons';
import { useDialogFit } from '@/hooks/useDialogFit';
import RlSelect, { type RlOption } from '@/components/inputs/RlSelect';

/**
 * Setting a gambling limit.
 *
 * The design puts the kind inside the dialog rather than on the page, which is
 * what lets one button on the panel reach all four limits. Three controls and
 * one action: type, amount, period, Add Limit.
 *
 * It does not carry the cooling-off explanation the previous version showed
 * before saving — that copy now lives on the panel behind it, where the design
 * puts it ("Removing a limit — takes effect at 00:00 (UTC+0)...").
 */
interface Props {
  /** What the player already has, so a field can open on its current value. */
  limits: LimitSet | null;
  onClose: () => void;
  onSubmit: (kind: LimitKind, period: LimitPeriod, amount: string) => void;
  saving?: boolean;
}

/**
 * The design shows "24 Hours" in the period control. The other two follow its
 * register rather than the "Per week" wording used elsewhere in the app, so the
 * three read as one set.
 *
 * The panel's copy also offers a quarterly period. There is no `quarterly` in
 * `LimitPeriod`, so it is not offered here — adding it is a change to the type,
 * the service and whatever enforces limits, not to this dialog.
 */
const PERIOD_OPTIONS: readonly { value: LimitPeriod; labelKey: TranslationKey }[] = [
  { value: 'daily', labelKey: 'rgc.duration24h' },
  { value: 'weekly', labelKey: 'rgc.duration7d' },
  { value: 'monthly', labelKey: 'rgc.duration30d' },
];

/** Label over a control. Onest Medium 14/20 in the design. */
const FieldLabel: FC<{ htmlFor: string; children: ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm leading-5 font-medium text-[#f0f1f5]">
    {children}
  </label>
);

/* The value a control shows: Onest Bold 18/24, 24 in from the control's edge.
   `RlSelect` carries the same string for the two dropdowns; this is what is
   left for the amount field. */
const CONTROL =
  'rl-modal-field h-14 w-full appearance-none ps-6 text-[18px] leading-6 font-bold text-[#f0f1f5] outline-none focus-visible:border-white/30';

const SetLimitModal: FC<Props> = ({ limits, onClose, onSubmit, saving = false }) => {
  const { t } = useTranslation();

  const kindOptions: RlOption<LimitKind>[] = LIMIT_DEFINITIONS.map((d) => ({
    value: d.kind,
    label: t(d.labelKey),
  }));
  const periodOptions: RlOption<LimitPeriod>[] = PERIOD_OPTIONS.map((p) => ({
    value: p.value,
    label: t(p.labelKey),
  }));

  const [kind, setKind] = useState<LimitKind | ''>('');
  const [period, setPeriod] = useState<LimitPeriod>('daily');
  const [amount, setAmount] = useState('');

  // Escape closes, and the page behind does not scroll while this is open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  // Opening a kind that already has a limit shows what it is now, so the player
  // is editing a figure rather than guessing at one.
  useEffect(() => {
    if (!kind) return;
    const current = limits?.[kind] ?? null;
    if (current) {
      setPeriod(current.period);
      setAmount(current.amount);
    }
  }, [kind, limits]);

  // Zoomed to the page's scale, with the room it has worked out after the
  // zoom — see useDialogFit.
  const { scale, tier, maxHeight } = useDialogFit(true);

  const parsed = Number(amount);
  const valid = kind !== '' && amount.trim() !== '' && Number.isFinite(parsed) && parsed > 0;
  const isMinutes = LIMIT_DEFINITIONS.find((d) => d.kind === kind)?.unit === 'minutes';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rg-limit-title"
        onClick={(e) => e.stopPropagation()}
        /* Capped and scrollable for the same reason the exclusion dialog is:
           this one is only 484 tall and fits a laptop today, but with no cap at
           all a shorter window would push it off the screen with no way to
           reach the button. The cap never bites at the design's 1080. */
        className="rl-modal-glass flex w-full max-w-[581px] flex-col p-7"
        style={{ zoom: scale, maxHeight: maxHeight(0.92) }}
      >
        {/* 48px glass circle, 28 in from the top right — the same mark the rail
            and the footer use. */}
        <div className="flex shrink-0 items-start">
          <h2
            id="rg-limit-title"
            className="min-w-0 flex-1 text-center text-[22px] leading-8 font-medium tracking-[-0.56px] text-[#f0f1f5] sm:text-[28px] sm:leading-9"
          >
            {t('rgc.limitsSet')}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('rgc.close')}
            className="rl-circle-btn -mt-2 flex h-12 w-12 shrink-0 items-center justify-center"
          >
            <CloseIcon size={33} strokeWidth={1.45} />
          </button>
        </div>

        {/* `min-h-0` is what lets this shrink and scroll instead of growing and
            pushing the button out of the dialog. */}
        <div className="thin-scrollbar mt-6 min-h-0 flex-1 space-y-4 overflow-y-auto">
          {/* ── Limit Type ─────────────────────────────────────────────── */}
          <div className="space-y-1.75">
            <FieldLabel htmlFor="rg-limit-kind">{t('rgc.limitTypeLabel')}</FieldLabel>

            <RlSelect
              id="rg-limit-kind"
              value={kind}
              options={kindOptions}
              onChange={setKind}
              placeholder={t('rgc.limitTypeLabel')}
            />
          </div>

          {/* ── Limit Amount ───────────────────────────────────────────── */}
          <div className="space-y-1.75">
            <FieldLabel htmlFor="rg-limit-amount">{t('rgc.limitAmount')}</FieldLabel>

            <div className="relative">
              <input
                id="rg-limit-amount"
                type="number"
                inputMode="decimal"
                min={isMinutes ? 5 : 1}
                step={isMinutes ? 5 : 'any'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`${CONTROL} pe-14 tabular-nums`}
              />
              <span className="pointer-events-none absolute end-6 top-1/2 -translate-y-1/2 text-[18px] leading-6 font-bold text-[#f0f1f5]">
                {isMinutes ? t('rgc.limitMinutes') : DISPLAY_CURRENCY_SYMBOL}
              </span>
            </div>
          </div>

          {/* ── Limit Period ───────────────────────────────────────────── */}
          <div className="space-y-1.75">
            <FieldLabel htmlFor="rg-limit-period">{t('rgc.limitPeriod')}</FieldLabel>

            {/* The design prints a "$" at this control's end, the same glyph as
                the amount field above it. That is a paste, not an instruction —
                this is a period, not a sum — so it carries the chevron its
                sibling control has. */}
            <RlSelect
              id="rg-limit-period"
              value={period}
              options={periodOptions}
              onChange={setPeriod}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            valid &&
            onSubmit(
              kind as LimitKind,
              period,
              isMinutes ? String(Math.round(parsed)) : parsed.toFixed(2)
            )
          }
          disabled={!valid || saving}
          className={`rl-btn-gold ${tier === 'full' ? 'mt-6.25' : 'mt-4'} flex h-14 shrink-0 items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {saving ? t('rgc.saving') : t('rgc.limitAdd')}
        </button>
      </div>
    </div>
  );
};

export default SetLimitModal;
