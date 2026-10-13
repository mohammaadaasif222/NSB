import { useEffect, useState, type FC } from 'react';
import { toast } from 'react-toastify';

import Modal from '@/components/ui/Modal';
import CircleIconButton from '@/components/ui/CircleIconButton';
import { CloseIcon, StarIcon } from '@/components/icons';
import { useTranslation } from '@/context/I18nContext';
import {
  removeMyReview,
  submitReview,
  type PromotionReview,
  type RatingSummary,
  type SubmittedReview,
} from '@/services/promotionReviews';
import type { ApiError } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  promotionId: string;
  onSubmitted: (result: SubmittedReview) => void;
  existing: PromotionReview | null;
  onRemoved: (summary: RatingSummary) => void;
}

const TITLE_ID = 'rate-promotion-title';


const RatePromotionModal: FC<Props> = ({
  open,
  onClose,
  promotionId,
  onSubmitted,
  existing,
  onRemoved,
}) => {
  const { t } = useTranslation();
  const scale = useStageScale(open);
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [remark, setRemark] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setScore(existing?.rating ?? 0);
      setHover(0);
      setRemark(existing?.remark ?? '');
      setSending(false);
    }
 }, [open]);

  const remove = async (): Promise<void> => {
    if (sending) return;
    setSending(true);
    try {
      onRemoved(await removeMyReview(promotionId));
      toast.success(t('promo.reviewRemoved'));
      onClose();
    } catch (error) {
      toast.error((error as Partial<ApiError>).message || t('promo.reviewFailed'));
      setSending(false);
    }
  };

  const submit = async (): Promise<void> => {
    if (score === 0 || sending) return;
    setSending(true);
    try {
      const result = await submitReview(promotionId, score, remark.trim());
      onSubmitted(result);
      toast.success(t(existing ? 'promo.reviewUpdated' : 'promo.reviewThanks'));
      onClose();
    } catch (error) {
      const failure = error as Partial<ApiError>;
      toast.error(failure.message || t('promo.reviewFailed'));
      setSending(false);
    }
  };

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
        maxLength={500}
        placeholder={t('promo.addRemark')}
        aria-label={t('promo.addRemark')}
        className="rl-modal-field mt-5 h-[150px] w-full resize-none border-white/20 px-5 py-4 text-[16px] leading-6 text-[#f0f1f5] placeholder:text-[#9da2b4] lg:mt-[calc(var(--u)*24)] lg:h-[calc(var(--u)*192)] lg:px-[calc(var(--u)*24)] lg:py-[calc(var(--u)*26)] lg:text-[max(12px,calc(var(--u)*18))]"
      />

      <button
        type="button"
        onClick={() => void submit()}
        disabled={score === 0 || sending}
        className="rl-btn-gold mt-5 h-12 w-full rounded-full text-[16px] font-medium disabled:cursor-not-allowed lg:mt-[calc(var(--u)*37)] lg:h-[calc(var(--u)*56)] lg:rounded-[calc(var(--u)*34)] lg:text-[max(12px,calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)]"
      >
        {t(existing ? 'promo.updateRating' : 'promo.submitRating')}
      </button>

      {existing && (
        <button
          type="button"
          onClick={() => void remove()}
          disabled={sending}
          className="mx-auto mt-4 block text-[14px] text-[#9da2b4] underline-offset-4 transition-colors hover:text-[#f0f1f5] hover:underline disabled:opacity-50"
        >
          {t('promo.removeReview')}
        </button>
      )}
    </Modal>
  );
};

export default RatePromotionModal;
