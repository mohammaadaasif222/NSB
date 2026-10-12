import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { useStageScale } from '@/hooks/useStageScale';
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
  /**
   * The pane's tint: `clear` — nearly all blur (the wallet, Select Game);
   * `grey` — the design's lighter grey glass (the suggestion box).
   */
  tone?: 'clear' | 'grey';
  /** Whether the page behind is dimmed (the default) or left clear. */
  backdrop?: 'dim' | 'none';
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
  tone = 'clear',
  backdrop = 'dim',
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
      className={`${tone === 'grey' ? '[--dialog-fill:rgba(89,89,89,0.2)]' : ''} ${className}`}
    >
      <ModalHeader
        id={titleId}
        title={title}
        variant={titleVariant}
        onClose={onClose}
        closeLabel={t('common.close')}
      />
      {children}
    </Modal>
  );
};

export default GlassDialog;
