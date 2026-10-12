import type { FC } from 'react';
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
   * `hero` = large bold title (first step); `compact` = one-line step title;
   * `section` = the 24px semibold title of a short chooser (Register with).
   */
  variant?: 'hero' | 'compact' | 'section';
}

/**
 * The modal's top rail: back on the start edge, title centred, close on the
 * end edge. Both side slots keep their width even when empty, so the title
 * stays optically centred on every step.
 */
const ModalHeader: FC<ModalHeaderProps> = ({
  id,
  title,
  onClose,
  closeLabel,
  onBack,
  backLabel = 'Back',
  variant = 'compact',
}) => (
  <div className="relative z-10 flex items-center gap-3">
    <div className="flex w-10 shrink-0 sm:w-12">
      {onBack && (
        <CircleIconButton label={backLabel} onClick={onBack}>
          <ChevronLeftIcon size={22} className="rtl:rotate-180" />
        </CircleIconButton>
      )}
    </div>

    <h2
      id={id}
      className={`min-w-0 flex-1 text-center text-white ${
        variant === 'hero'
          ? 'pt-3 text-[32px] font-bold leading-tight sm:pt-5 sm:text-[40px]'
          : variant === 'section'
            ? 'text-[24px] font-semibold leading-8 text-[#f0f1f5]'
            : 'text-base font-medium sm:text-lg'
      }`}
    >
      {title}
    </h2>

    <div
      className={`flex w-10 shrink-0 justify-end sm:w-12 ${variant === 'hero' ? 'self-start' : ''}`}
    >
      <CircleIconButton label={closeLabel} onClick={onClose}>
        <CloseIcon size={22} />
      </CircleIconButton>
    </div>
  </div>
);

export default ModalHeader;
