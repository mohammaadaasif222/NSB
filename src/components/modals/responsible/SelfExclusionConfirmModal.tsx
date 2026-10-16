import { useEffect, useState, type FC } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/I18nContext';
import {
  EXCLUSION_CONFIRM_PHRASE_FALLBACK,
  EXCLUSION_CONFIRM_PHRASE_KEY,
  type ExclusionOption,
} from '@/components/responsible/rgContent';
import type { TranslationKey } from '@/i18n/locales';
import { CloseIcon } from '@/components/icons';
import { useDialogFit } from '@/hooks/useDialogFit';
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
const DURATION_LABEL: Record<string, TranslationKey> = {
  '24h': 'rgc.duration24h',
  '7d': 'rgc.duration7d',
  '30d': 'rgc.duration30d',
  '3m': 'rgc.duration3m',
  '6m': 'rgc.duration6m',
  '1y': 'rgc.duration1y',
  '5y': 'rgc.duration5y',
};

/**
 * Folds a typed phrase for comparison: upper-cased in the player's locale (so
 * Turkish i/İ behave), accents and other combining marks dropped, and anything
 * that is not a letter or digit — spaces, hyphens — ignored. Applied to both
 * sides, so it only ever makes the match more forgiving, never wrong.
 */
const foldPhrase = (s: string, locale: string): string =>
  s
    .trim()
    .toLocaleUpperCase(locale)
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}]/gu, '');

const dmy = (d: Date): string =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

const SelfExclusionConfirmModal: FC<Props> = ({ option, onClose, onConfirm, saving = false }) => {
  const { t, locale } = useTranslation();
  const [typed, setTyped] = useState('');

  const phrase = t(EXCLUSION_CONFIRM_PHRASE_KEY);
  const periodLabel = t(option.labelKey);

  const needsPhrase = option.requiresTypedConfirmation === true;
  const ready =
    !needsPhrase ||
    [phrase, EXCLUSION_CONFIRM_PHRASE_FALLBACK].some(
      (p) => foldPhrase(typed, locale) === foldPhrase(p, locale)
    );

  /**
   * The typed-phrase gate adds about 107px, which pushes this dialog past a
   * laptop even at 768 where the height-based tier does not fire. So the two
   * options that carry it take the tighter rhythm on their own account, at any
   * height, rather than waiting for the screen to be short enough.
   */
  const tight = needsPhrase;

  /**
   * Drawn at the design's sizes and zoomed to the page's scale, so on a laptop
   * it sits in proportion with the page instead of standing over it at full
   * size. The vertical rhythm closes up by how much room the *zoomed* card has
   * (`tier`), not by raw window height — see useDialogFit.
   */
  const { scale, tier, maxHeight } = useDialogFit(true);
  const short = tier === 'short';
  const compact = tight || short;
  const ICON = compact ? 'size-6' : 'size-8.75';
  const TEXT_PT = compact ? 'pt-0' : 'pt-1.5';
  const FIELD_H = compact ? 'min-h-12' : 'min-h-14';
  /** The rhythm's three steps, at sm and up: the design's, closer, closest. */
  const step = (full: string, mid: string, low: string): string =>
    tier === 'full' ? full : tier === 'mid' ? mid : low;

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
      ? periodLabel
      : (() => {
          const end = new Date(start);
          end.setDate(end.getDate() + days);
          const lengthKey = DURATION_LABEL[option.value];
          const length = lengthKey ? t(lengthKey) : periodLabel;
          return `${dmy(start)} (${t('rgc.exclusionToday')}) - ${dmy(end)} (${length})`;
        })();

  const points = [
    t('rgc.exclusionPoint1', { period: periodLabel }),
    t('rgc.exclusionPoint2'),
    t('rgc.exclusionPoint3', { period: periodLabel }),
    t('rgc.exclusionPoint4'),
  ];

  const BUTTON = `flex ${compact ? 'h-12' : 'h-14'} w-full items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium`;

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
        /* 718 tall in the design, drawn on a 1080 frame. Three things keep it
           in proportion and usable on a laptop without touching that layout:

           1. It is zoomed to the page's scale, so at 1366 it is drawn at about
              0.71 — the size the design intends there, and short enough to fit
              a laptop window as drawn.
           2. Only when even the zoomed card is short of room (`tier`, worked
              out after the zoom) does the vertical rhythm close up — about
              75px saved, without the dialog scrolling.
           3. If the window is shorter still, only the middle scrolls. The
              title and both buttons are outside that box and stay put.

           Scrolling is the fallback here, not the plan. A dialog whose actions
           have to be hunted for is not responsive, it is just reachable. */
        className={`rl-modal-glass flex w-full max-w-[581px] flex-col p-5 ${step('sm:p-7', 'sm:p-5', 'sm:p-5')}`}
        style={{ zoom: scale, maxHeight: maxHeight(tight || short ? 0.96 : 0.92) }}
      >
        <div className="flex shrink-0 items-start">
          <h2
            id="rg-exclusion-title"
            className="min-w-0 flex-1 text-center text-[20px] leading-7 font-medium tracking-[-0.56px] text-[#f0f1f5] sm:text-[28px] sm:leading-9"
          >
            {t('rgc.exclusionConfirmTitle', { period: periodLabel })}
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

        {/* Everything between the title and the buttons. `min-h-0` is what lets
            a flex child actually shrink below its content and scroll; without
            it this grows instead and pushes the actions out of the dialog. */}
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
          {/* ── The dates the break covers ────────────────────────────── */}
          <p
            className={`mt-4 ${step('sm:mt-7.5', 'sm:mt-4', 'sm:mt-2.5')} text-sm leading-5 font-medium text-[#f0f1f5]`}
          >
            {t('rgc.exclusionBreakPeriod')}
          </p>
          {/* One line at every width: on a narrow screen the type comes down
            with the field (it is its own size container) rather than wrapping
            the range in two — 18px wherever it fits. */}
          <p
            className={`rl-modal-field ${short ? 'mt-1' : 'mt-1.75'} flex ${FIELD_H} items-center px-4 py-2 [container-type:inline-size] sm:px-6`}
          >
            <span className="whitespace-nowrap text-[min(18px,4.9cqw)] leading-6 font-medium text-[#f0f1f5]">
              {range}
            </span>
          </p>

          <p className={`${short ? 'mt-2' : 'mt-3.5'} text-base leading-6 text-[#9da2b4]`}>
            {t('rgc.exclusionConfirmBody')}
          </p>

          <p
            className={`mt-4 ${step('sm:mt-7.5', 'sm:mt-4', 'sm:mt-2.5')} text-base leading-6 text-[#f0f1f5]`}
          >
            {t('rgc.exclusionUnderstand')}
          </p>

          {/* 35px mark, 39 to the text, 48 between rows — the design's list. */}
          <ul
            className={`${short ? 'mt-2' : 'mt-3.5'} space-y-2 ${step('sm:space-y-3.25', 'sm:space-y-2', 'sm:space-y-1.5')}`}
          >
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
                <span className={`min-w-0 flex-1 ${TEXT_PT} text-base leading-6 text-[#f0f1f5]`}>
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
                {t('rgc.exclusionTypeToConfirm', { phrase })}
              </label>
              <input
                id="rg-exclusion-phrase"
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={phrase}
                className="rl-modal-field h-12 w-full px-6 text-[18px] leading-6 font-bold tracking-wide text-[#f0f1f5] uppercase outline-none focus-visible:border-white/30"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!ready || saving}
          className={`rl-btn-gold ${BUTTON} mt-4 shrink-0 disabled:cursor-not-allowed disabled:opacity-50 ${step('sm:mt-7.25', 'sm:mt-4', 'sm:mt-3')}`}
        >
          {saving ? t('rgc.saving') : t('rgc.exclusionConfirmWith', { period: periodLabel })}
        </button>

        <button
          type="button"
          onClick={onClose}
          className={`${BUTTON} ${short ? 'mt-2' : 'mt-2.5'} shrink-0 bg-white/10 text-[#f0f1f5] transition-colors hover:bg-white/15 ${step('sm:mt-3.25', 'sm:mt-2.5', 'sm:mt-2')}`}
        >
          {t('rgc.cancel')}
        </button>
      </div>
    </div>
  );
};

export default SelfExclusionConfirmModal;
