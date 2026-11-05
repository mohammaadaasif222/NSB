import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useStageScale } from '@/hooks/useStageScale';
import { ChevronLeftIcon } from '@/components/icons';
import Modal from './Modal';
import ModalHeader from './ModalHeader';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Unique per dialog: the heading id the dialog is labelled by. */
  titleId: string;
  title: string;
  /** `title` — 28px, centred (Wallet); `panel` — 20px at the start edge. */
  titleVariant?: 'title' | 'panel';
  /** Whether the page behind is dimmed (the default) or left clear. */
  backdrop?: 'dim' | 'none';
  /**
   * Below `sm`, a sheet rising from the screen's foot; `fit` sizes it to its
   * content; `page` makes it a page under the bar, with a back button before
   * the title in place of the close (see Modal).
   */
  phoneSheet?: boolean | 'fit' | 'page';
  /** Extra classes for the title (see ModalHeader). */
  titleClassName?: string;
  /** Classes for the card: width, padding, height. */
  className?: string;
  children: ReactNode;
}

/**
 * The player app's glass dialog — the wallet, Select Game, the suggestion box:
 * the design's "Liquid Glass – Regular" card (`rl-dialog-glass`), its title
 * and close button, and the page's scale, so it keeps the design's proportions
 * against the page on a laptop (see useStageScale).
 *
 * The design measures its insets from the outside of the card's rim; the rim
 * here is a 1px border, so a caller's padding is the design's less a pixel.
 */
const GlassDialog: FC<Props> = ({
  open,
  onClose,
  titleId,
  title,
  titleVariant = 'panel',
  backdrop = 'dim',
  phoneSheet = false,
  titleClassName,
  className = '',
  children,
}) => {
  const { t } = useTranslation();
  const scale = useStageScale(open);

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      surface="rl-dialog-glass"
      style={{ zoom: scale }}
      backdrop={backdrop}
      phoneSheet={phoneSheet}
      className={className}
    >
      {phoneSheet === 'page' && (
        <div className="flex items-center gap-3 sm:hidden">
          <button
            data-sound="close"
            type="button"
            onClick={onClose}
            aria-label={t('auth.back')}
            className="rl-glass-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f0f1f5]"
          >
            <ChevronLeftIcon size={20} className="rtl:rotate-180" />
          </button>
          <p
            aria-hidden="true"
            className="truncate text-[24px] font-medium leading-8 text-[#f0f1f5]"
          >
            {title}
          </p>
        </div>
      )}
      <div className={phoneSheet === 'page' ? 'max-sm:hidden' : undefined}>
        <ModalHeader
          id={titleId}
          title={title}
          variant={titleVariant}
          titleClassName={titleClassName}
          onClose={onClose}
          closeLabel={t('common.close')}
        />
      </div>
      <div className="rl-modal-body">{children}</div>
    </Modal>
  );
};

export default GlassDialog;
