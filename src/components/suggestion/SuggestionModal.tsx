import { useRef, useState, type FC, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/ui/Button';
import DisclosureSelect from '@/components/ui/DisclosureSelect';
import GlassDialog from '@/components/ui/GlassDialog';
import { useTranslation } from '@/context/I18nContext';
import type { TranslationKey } from '@/i18n/locales';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Category = 'feature' | 'transparency' | 'fairness' | 'ux' | 'other';

/** The design's categories, in its order. */
const CATEGORIES: { value: Category; label: TranslationKey }[] = [
  { value: 'feature', label: 'suggest.cat.feature' },
  { value: 'transparency', label: 'suggest.cat.transparency' },
  { value: 'fairness', label: 'suggest.cat.fairness' },
  { value: 'ux', label: 'suggest.cat.ux' },
  { value: 'other', label: 'suggest.cat.other' },
];

/** Where suggestions land — the inbox the rail's button always mailed. */
const INBOX = 'support@xyzlife.top';
const TITLE_ID = 'suggestion-title';

/**
 * The suggestion box, from the rail: the design's 566px grey glass dialog — a
 * category that opens in place, the idea itself, a word on what happens to
 * it, and Submit Suggestion.
 *
 * There is no suggestions endpoint, so submitting hands a filled-in email to
 * the player's mail app — the same inbox the rail's button reached before
 * this dialog existed. Wiring an endpoint is `submit` alone.
 */
const SuggestionModal: FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<Category | ''>('');
  const [idea, setIdea] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const ideaRef = useRef<HTMLTextAreaElement>(null);

  const options = CATEGORIES.map((c) => ({ value: c.value, label: t(c.label) }));

  // The button stays live, as drawn; an incomplete form points at the gap.
  const submit = (e: FormEvent): void => {
    e.preventDefault();
    const picked = options.find((o) => o.value === category);
    if (!picked) {
      pickerRef.current?.querySelector('button')?.focus();
      return;
    }
    if (!idea.trim()) {
      ideaRef.current?.focus();
      return;
    }

    const subject = `${t('suggest.mailSubject')}: ${picked.label}`;
    window.location.href = `mailto:${INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(idea.trim())}`;
    toast.success(t('suggest.thanks'));
    setCategory('');
    setIdea('');
    onClose();
  };

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      titleId={TITLE_ID}
      title={t('suggest.title')}
      tone="grey"
      // A phone's title is the design's 16px, 8 under the close's top.
      titleClassName="max-sm:!text-[16px] max-sm:!leading-6"
      // The design's insets, less the rim's pixel: 14 / 24 / 26 on a phone,
      // 20 / 24 from sm.
      className="max-w-[566px] px-[13px] pb-[25px] pt-[23px] sm:px-[19px] sm:pb-[23px] sm:pt-[19px]"
    >
      <form onSubmit={submit} noValidate>
        <div ref={pickerRef} className="mt-[14px] sm:mt-[10px]">
          <DisclosureSelect
            id="suggestion-category"
            options={options}
            value={category}
            onChange={setCategory}
            placeholder={t('suggest.category')}
          />
        </div>

        <textarea
          ref={ideaRef}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={t('suggest.placeholder')}
          aria-label={t('suggest.placeholder')}
          className="mt-[13px] block h-[151px] w-full resize-none rounded-[24px] border border-white/20 bg-white/5 p-5 text-[12px] leading-5 text-[#f0f1f5] outline-none transition-colors placeholder:text-[#f0f1f5] focus:border-white/30 sm:mt-4 sm:text-[16px] sm:leading-6"
        />

        <p className="mt-[13px] text-[12px] leading-4 text-[#9da2b4] sm:mt-[10px] sm:text-[14px] sm:leading-5">
          {t('suggest.body')}
        </p>

        <Button type="submit" fullWidth className="mt-[30px] !font-semibold max-sm:!h-14 sm:mt-4">
          {t('suggest.submit')}
        </Button>
      </form>
    </GlassDialog>
  );
};

export default SuggestionModal;
