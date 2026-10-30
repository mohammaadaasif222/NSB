import { useRef, useState, type FC, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { CheckIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import DisclosureSelect from '@/components/ui/DisclosureSelect';
import GlassDialog from '@/components/ui/GlassDialog';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';
import {
  SUGGESTION_CATEGORIES,
  SUGGESTION_MAX_LENGTH,
  SUGGESTION_MIN_LENGTH,
  sendSuggestion,
  type SuggestionCategory,
} from '@/services/suggestions';
import type { ApiError } from '@/types/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const TITLE_ID = 'suggestion-title';

/**
 * The suggestion box, from the rail: the design's 566px grey glass dialog — a
 * category that opens in place, the idea itself, a word on what happens to
 * it, and Submit Suggestion. Once sent, the dialog turns into a thank-you;
 * the backend also leaves one in the player's notifications. The rail only
 * opens it for a signed-in player.
 */
const SuggestionModal: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<SuggestionCategory | ''>('');
  const [idea, setIdea] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const ideaRef = useRef<HTMLTextAreaElement>(null);

  const options = SUGGESTION_CATEGORIES.map((value) => ({
    value,
    label: t(`suggest.cat.${value}` as TranslationKey),
  }));

  const close = (): void => {
    onClose();
    if (sent) {
      setSent(false);
      setCategory('');
      setIdea('');
    }
  };

  // The button stays live, as drawn; an incomplete form points at the gap.
  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!category) {
      pickerRef.current?.querySelector('button')?.focus();
      return;
    }
    const text = idea.trim();
    if (text.length < SUGGESTION_MIN_LENGTH) {
      toast.error(t('suggest.tooShort', { count: SUGGESTION_MIN_LENGTH }));
      ideaRef.current?.focus();
      return;
    }

    setSending(true);
    try {
      await sendSuggestion(category, text);
      setSent(true);
    } catch (err) {
      toast.error((err as ApiError).message || t('suggest.failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <GlassDialog
      open={open}
      onClose={close}
      titleId={TITLE_ID}
      title={sent ? t('suggest.thanksTitle') : t('suggest.title')}
      tone="grey"
      // A phone's title is the design's 16px, 8 under the close's top.
      titleClassName="max-sm:!text-[16px] max-sm:!leading-6"
      // The design's insets, less the rim's pixel: 14 / 24 / 26 on a phone,
      // 20 / 24 from sm.
      className="max-w-[566px] px-[13px] pb-[25px] pt-[23px] sm:px-[19px] sm:pb-[23px] sm:pt-[19px]"
    >
      {sent ? (
        <div className="flex flex-col items-center pt-6 text-center" role="status">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffd400]/15 text-[#ffd400]">
            <CheckIcon className="h-8 w-8" />
          </span>
          <p className="mt-5 max-w-[420px] text-[14px] leading-5 text-[#f0f1f5] sm:text-[16px] sm:leading-6">
            {t('suggest.thanksBody')}
          </p>
          <Button
            type="button"
            fullWidth
            onClick={close}
            className="mt-[30px] !font-semibold max-sm:!h-14 sm:mt-6"
          >
            {t('suggest.done')}
          </Button>
        </div>
      ) : (
        <form onSubmit={(e) => void submit(e)} noValidate>
          <div ref={pickerRef} className="mt-[14px] sm:mt-[10px]">
            <DisclosureSelect
              id="suggestion-category"
              options={options}
              value={category}
              onChange={setCategory}
              placeholder={t('suggest.category')}
            />
          </div>

          <div className="relative mt-[13px] sm:mt-4">
            <textarea
              ref={ideaRef}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              maxLength={SUGGESTION_MAX_LENGTH}
              placeholder={t('suggest.placeholder')}
              aria-label={t('suggest.placeholder')}
              className="block h-[151px] w-full resize-none rounded-[24px] border border-white/20 bg-white/5 p-5 pb-8 text-[12px] leading-5 text-[#f0f1f5] outline-none transition-colors placeholder:text-[#f0f1f5] focus:border-white/30 sm:text-[16px] sm:leading-6"
            />
            <span className="pointer-events-none absolute bottom-3 end-5 text-[11px] text-[#9da2b4]">
              {idea.length}/{SUGGESTION_MAX_LENGTH}
            </span>
          </div>

          <p className="mt-[13px] text-[12px] leading-4 text-[#9da2b4] sm:mt-[10px] sm:text-[14px] sm:leading-5">
            {t('suggest.body')}
          </p>

          <Button
            type="submit"
            fullWidth
            loading={sending}
            className="mt-[30px] !font-semibold max-sm:!h-14 sm:mt-4"
          >
            {t('suggest.submit')}
          </Button>
        </form>
      )}
    </GlassDialog>
  );
};

export default SuggestionModal;
