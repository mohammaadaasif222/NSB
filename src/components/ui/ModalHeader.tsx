import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { ChevronLeftIcon, CloseIcon } from '@/components/icons';
import CircleIconButton from '@/components/ui/CircleIconButton';

interface ModalHeaderProps {
  /** Id for the heading, so the dialog can point aria-labelledby at it. */
  id: string;
  title: string;
  onClose: () => void;
  closeLabel: string;
  /** Shows the back button when given. */
  onBack?: () => void;
  backLabel?: string;
  /**
   * `hero` = large title (first step), centred on the close control; `compact` = one-line step title;
   * `section` = the 24px semibold title of a short chooser (Register with);
   * `title` = the 28px semibold title of a tabbed dialog (Wallet);
   * `panel` = the 20px medium title at the start edge, no back slot (Select
   * Game, the suggestion box).
   */
  variant?: 'hero' | 'compact' | 'section' | 'title' | 'panel';
}

/**
 * The modal's top rail: back on the start edge, title centred, close on the
 * end edge. Both side slots keep their width even when empty, so the title
 * stays optically centred on every step — except `panel`, whose title starts
 * at the edge.
 */
const ModalHeader: FC<ModalHeaderProps> = ({
  id,
  title,
  onClose,
  closeLabel,
  onBack,
  backLabel,
  variant = 'compact',
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10 flex items-center gap-3">
      {variant !== 'panel' && (
        <div className="flex w-10 shrink-0 sm:w-12">
          {onBack && (
            <CircleIconButton label={backLabel ?? t('auth.back')} onClick={onBack}>
              <ChevronLeftIcon size={22} className="rtl:rotate-180" />
            </CircleIconButton>
          )}
        </div>
      )}

      <h2
        id={id}
        className={`min-w-0 flex-1 text-white ${variant === 'panel' ? 'text-start' : 'text-center'} ${
          variant === 'hero'
            ? 'text-[28px] font-medium leading-tight sm:text-[32px]'
            : variant === 'section'
              ? 'text-[24px] font-semibold leading-8 text-[#f0f1f5]'
              : variant === 'title'
                ? 'text-[24px] font-semibold leading-8 text-[#f0f1f5] sm:text-[28px] sm:leading-9'
                : variant === 'panel'
                  ? 'text-[18px] font-medium leading-7 text-[#f0f1f5] sm:text-[20px]'
                  : 'text-base font-medium sm:text-lg'
        }`}
      >
        {title}
      </h2>

      <div
        className="flex w-10 shrink-0 justify-end sm:w-12"
      >
        <CircleIconButton label={closeLabel} onClick={onClose}>
          {variant === 'title' || variant === 'panel' || variant === 'hero' ? (
            // The glass dialogs' cross: 16.7px across in 2px strokes.
            <CloseIcon size={33} strokeWidth={1.45} />
          ) : (
            <CloseIcon size={22} />
          )}
        </CircleIconButton>
      </div>
    </div>
  );
};

export default ModalHeader;
