import { useEffect, useState, type FC } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import { EXCLUSION_CONFIRM_PHRASE, type ExclusionOption } from '@/components/responsible/rgContent';
import { CloseIcon } from '@/components/icons';
import checkFill from '@/assets/responsible/check-fill.svg';

/**
 * The last step before an account is closed to its owner.
 *
 * The design lays it out as a read: the dates the break covers, what still
 * works during it, and four things the player is confirming they understand.
 * Nothing here tries to talk them out of it — an operator's last word before a
 * self-exclusion should not be a retention offer.
 *
 * The typed phrase is kept for the longest two options. It is not in the
 * design, but the design is drawn for a 24-hour cooldown; a frame for a one-day
 * break does not authorise dropping the only gate in front of a permanent
 * account closure.
 */
interface Props {
  option: ExclusionOption;
  onClose: () => void;
  onConfirm: () => void;
  saving?: boolean;
}

/** How far past today each option runs. `null` never ends. */
const DURATION_DAYS: Record<string, number | null> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '3m': 91,
  '6m': 182,
  '1y': 365,
  '5y': 1826,
  permanent: null,
};

/**
 * What closes the date range — the length of the break, not the name of the
 * option. The design writes "… - 22/07/2026 (24 Hours)", so the Cooldown half
 * of "24 Hours Cooldown" is left off; putting the whole label there ran the
 * line past the end of the field.
 */
const DURATION_LABEL: Record<string, string> = {
  '24h': '24 Hours',
  '7d': '7 Days',
  '30d': '30 Days',
  '3m': '3 Months',
  '6m': '6 Months',
  '1y': '1 Year',
  '5y': '5 Years',
};

const dmy = (d: Date): string =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

const SelfExclusionConfirmModal: FC<Props> = ({ option, onClose, onConfirm, saving = false }) => {
  const { t } = useTranslation();
  const [typed, setTyped] = useState('');

  const needsPhrase = option.requiresTypedConfirmation === true;
  const ready = !needsPhrase || typed.trim().toUpperCase() === EXCLUSION_CONFIRM_PHRASE;

  /**
   * The typed-phrase gate adds about 107px, which pushes this dialog past a
   * laptop even at 768 where the height-based tier does not fire. So the two
   * options that carry it take the tighter rhythm on their own account, at any
   * height, rather than waiting for the screen to be short enough.
   */
  const tight = needsPhrase;
  const ICON = tight ? 'size-6' : 'size-8.75 [@media(max-height:700px)]:size-6';
  const TEXT_PT = tight ? 'pt-0' : 'pt-1.5 [@media(max-height:700px)]:pt-0';
  const FIELD_H = tight ? 'min-h-12' : 'min-h-14 [@media(max-height:700px)]:min-h-12';

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

  const days = DURATION_DAYS[option.value] ?? null;
  const start = new Date();
  const range =
    days === null
      ? option.label
      : (() => {
          const end = new Date(start);
          end.setDate(end.getDate() + days);
          const length = DURATION_LABEL[option.value] ?? option.label;
          return `${dmy(start)} (${t('rg.exclusionToday')}) - ${dmy(end)} (${length})`;
        })();

  const points = [
    t('rg.exclusionPoint1', { period: option.label }),
    t('rg.exclusionPoint2'),
    t('rg.exclusionPoint3', { period: option.label }),
    t('rg.exclusionPoint4'),
  ];

  const BUTTON = `flex ${tight ? 'h-12' : 'h-14 [@media(max-height:700px)]:h-12'} w-full items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rg-exclusion-title"
        onClick={(e) => e.stopPropagation()}
        /* 718 tall in the design, drawn on a 1080 frame — and a laptop gives
           the browser roughly 650 to 710. Two things keep it usable there
           without touching the 1080 layout:

           1. Below 820 of viewport height the vertical rhythm closes up (the
              `max-height` variants below). That saves about 75px, which is
              enough for the whole dialog to fit at 768 and 720 — so it does not
              scroll at all on a normal laptop, it just sits tighter.
           2. If the screen is shorter still, only the middle scrolls. The title
              and both buttons are outside that box and stay put.

           Scrolling is the fallback here, not the plan. A dialog whose actions
           have to be hunted for is not responsive, it is just reachable. */
        className="rl-modal-glass flex max-h-[96vh] w-full max-w-[581px] flex-col p-5 sm:max-h-[92vh] sm:p-7 [&:has(#rg-exclusion-phrase)]:sm:max-h-[96vh] [@media(min-height:701px)_and_(max-height:820px)]:sm:p-5 [@media(max-height:700px)]:sm:p-5 [@media(max-height:700px)]:sm:max-h-[96vh]"
      >
        <div className="flex shrink-0 items-start">
          <h2
            id="rg-exclusion-title"
            className="min-w-0 flex-1 text-center text-[20px] leading-7 font-semibold tracking-[-0.56px] text-[#f0f1f5] sm:text-[28px] sm:leading-9"
          >
            {t('rg.exclusionConfirmTitle', { period: option.label })}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="rl-chip -mt-2 flex h-12 w-12 shrink-0 items-center justify-center text-[#f0f1f5]"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Everything between the title and the buttons. `min-h-0` is what lets
            a flex child actually shrink below its content and scroll; without
            it this grows instead and pushes the actions out of the dialog. */}
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          {/* ── The dates the break covers ────────────────────────────── */}
          <p className="mt-4 sm:mt-7.5 [@media(min-height:701px)_and_(max-height:820px)]:sm:mt-4 [@media(max-height:700px)]:sm:mt-2.5 text-sm leading-5 font-medium text-[#f0f1f5]">
            {t('rg.exclusionBreakPeriod')}
          </p>
          {/* 56 tall on a desktop, where the line fits. It grows rather than
            truncates on a narrow screen: these dates are the thing being
            confirmed, and half a date is worse than two lines. */}
          <p
            className={`rl-modal-field mt-1.75 [@media(max-height:700px)]:mt-1 flex ${FIELD_H} items-center px-6 py-2 text-[18px] leading-6 font-bold text-[#f0f1f5]`}
          >
            {range}
          </p>

          <p className="mt-3.5 [@media(max-height:700px)]:mt-2 text-base leading-6 text-[#9da2b4]">
            {t('rg.exclusionConfirmBody')}
          </p>

          <p className="mt-4 sm:mt-7.5 [@media(min-height:701px)_and_(max-height:820px)]:sm:mt-4 [@media(max-height:700px)]:sm:mt-2.5 text-base leading-6 text-[#f0f1f5]">
            {t('rg.exclusionUnderstand')}
          </p>

          {/* 35px mark, 39 to the text, 48 between rows — the design's list. */}
          <ul className="mt-3.5 [@media(max-height:700px)]:mt-2 space-y-2 sm:space-y-3.25 [@media(min-height:701px)_and_(max-height:820px)]:sm:space-y-2 [@media(max-height:700px)]:sm:space-y-1.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-1">
                <Image
                  src={checkFill}
                  alt=""
                  width={35}
                  height={35}
                  className={`${ICON} shrink-0`}
                  aria-hidden="true"
                />
                <span
                  className={`min-w-0 flex-1 ${TEXT_PT} text-base leading-6 font-medium text-[#f0f1f5]`}
                >
                  {point}
                </span>
              </li>
            ))}
          </ul>

          {/* ── Kept for the longest two, which the design does not cover ── */}
          {needsPhrase && (
            <div className={`${tight ? 'mt-3' : 'mt-6'}`}>
              <label
                htmlFor="rg-exclusion-phrase"
                className="mb-1.75 block text-sm leading-5 font-medium text-[#f0f1f5]"
              >
                {t('rg.exclusionTypeToConfirm', { phrase: EXCLUSION_CONFIRM_PHRASE })}
              </label>
              <input
                id="rg-exclusion-phrase"
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={EXCLUSION_CONFIRM_PHRASE}
                className="rl-modal-field h-12 w-full px-6 text-[18px] leading-6 font-bold tracking-wide text-[#f0f1f5] uppercase outline-none focus-visible:border-white/30"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!ready || saving}
          className={`rl-btn-gold ${BUTTON} mt-4 shrink-0 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7.25 [@media(min-height:701px)_and_(max-height:820px)]:sm:mt-4 [@media(max-height:700px)]:sm:mt-3`}
        >
          {saving ? t('common.saving') : t('rg.exclusionConfirmWith', { period: option.label })}
        </button>

        <button
          type="button"
          onClick={onClose}
          className={`${BUTTON} mt-2.5 [@media(max-height:700px)]:mt-2 shrink-0 bg-white/10 text-[#f0f1f5] transition-colors hover:bg-white/15 sm:mt-3.25 [@media(min-height:701px)_and_(max-height:820px)]:sm:mt-2.5 [@media(max-height:700px)]:sm:mt-2`}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

export default SelfExclusionConfirmModal;
