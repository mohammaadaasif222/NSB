import { useEffect, useState, type FC } from 'react';

import Modal from '@/components/ui/Modal';
import CircleIconButton from '@/components/ui/CircleIconButton';
import { CloseIcon, StarIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import { useStageScale } from '@/hooks/useStageScale';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TITLE_ID = 'rate-promotion-title';

/**
 * "Rate the Promotion" — the design's 581×534 dialog.
 *
 * Nothing is submitted. There is no promotions table and no reviews endpoint,
 * so Submit closes the dialog and the score is dropped; wiring it up is a POST
 * and a toast once the feed exists.
 *
 * The score resets whenever the dialog opens rather than persisting between
 * openings: a half-finished rating left over from last time, shown as though
 * it had been recorded, would be worse than a blank one.
 *
 * Drawn at the page's scale. The dialog is portalled outside the player stage,
 * where `--u` falls back to 1px, so every `calc(var(--u)*…)` below resolves to
 * the design's full 1920 size; zooming the card by the stage's own scale (as
 * GlassDialog does) brings it back in proportion with the page behind it —
 * unzoomed, it stood half again too big on a laptop.
 */
const RatePromotionModal: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const scale = useStageScale(open);
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (open) {
      setScore(0);
      setHover(0);
      setRemark('');
    }
  }, [open]);

  // Hovering previews what a click would set, so the row reads ahead of it.
  const lit = hover || score;

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={TITLE_ID}
      style={{ zoom: scale }}
      className="max-w-[581px] px-5 pb-6 pt-5 lg:px-[calc(var(--u)*27)] lg:pb-[calc(var(--u)*43)] lg:pt-[calc(var(--u)*20)]"
    >
      <div className="flex items-start justify-between gap-3">
        {/* The title is optically centred on the card, so the close button's
            width is mirrored on the left rather than letting it push the
            heading off-centre. */}
        <span className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" aria-hidden="true" />
        <h2
          id={TITLE_ID}
          className="mt-1 flex-1 text-center text-[20px] font-semibold leading-8 tracking-[-0.02em] text-[#f0f1f5] lg:mt-[calc(var(--u)*9)] lg:text-[max(15px,calc(var(--u)*28))] lg:leading-[calc(var(--u)*36)]"
        >
          {t('promo.rateTitle')}
        </h2>
        <CircleIconButton label={t('common.close')} onClick={onClose}>
          <CloseIcon size={20} />
        </CircleIconButton>
      </div>

      <div
        className="mt-5 flex justify-center gap-1 lg:mt-[calc(var(--u)*37)] lg:gap-[calc(var(--u)*4)]"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            aria-label={t('promo.rateStars', { count: n })}
            aria-pressed={score === n}
            className="rounded-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#f9d028]"
          >
            <StarIcon
              className={`h-[52px] w-[52px] fill-current lg:h-[calc(var(--u)*77)] lg:w-[calc(var(--u)*77)] ${
                n <= lit
                  ? 'text-[#f9d028] drop-shadow-[0_0_12px_rgba(249,208,40,0.45)]'
                  : 'text-white/25'
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        placeholder={t('promo.addRemark')}
        aria-label={t('promo.addRemark')}
        className="rl-modal-field mt-5 h-[150px] w-full resize-none border-white/20 px-5 py-4 text-[16px] leading-6 text-[#f0f1f5] placeholder:text-[#9da2b4] lg:mt-[calc(var(--u)*24)] lg:h-[calc(var(--u)*192)] lg:px-[calc(var(--u)*24)] lg:py-[calc(var(--u)*26)] lg:text-[max(12px,calc(var(--u)*18))]"
      />

      <button
        type="button"
        onClick={onClose}
        disabled={score === 0}
        className="rl-btn-gold mt-5 h-12 w-full rounded-full text-[16px] font-medium disabled:cursor-not-allowed lg:mt-[calc(var(--u)*37)] lg:h-[calc(var(--u)*56)] lg:rounded-[calc(var(--u)*34)] lg:text-[max(12px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]"
      >
        {t('promo.submitRating')}
      </button>
    </Modal>
  );
};

export default RatePromotionModal;
