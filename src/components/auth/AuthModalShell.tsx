import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import Modal from '@/components/ui/Modal';
import ModalHeader from '@/components/ui/ModalHeader';

interface AuthModalShellProps {
  /** Unique per modal: the heading id the dialog is labelled by. */
  titleId: string;
  title: string;
  /** First screen of a journey: large bold title, no back button. */
  hero?: boolean;
  onBack?: () => void;
  onClose: () => void;
  /** Rendered under the body, at the card's inner padding (language + switch). */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * The frame every auth modal step sits in: the dark glass card, the
 * back / title / close rail, and the body inset the design uses.
 */
const AuthModalShell: FC<AuthModalShellProps> = ({
  titleId,
  title,
  hero = false,
  onBack,
  onClose,
  footer,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <Modal open onClose={onClose} labelledBy={titleId} className="max-w-[480px] p-3 sm:p-4">
      <ModalHeader
        id={titleId}
        title={title}
        variant={hero ? 'hero' : 'compact'}
        onClose={onClose}
        closeLabel={t('registerModal.close')}
        onBack={hero ? undefined : onBack}
        backLabel={t('auth.back')}
      />
      <div className="relative z-10 px-2 pb-2 pt-6 sm:px-8 sm:pt-7">{children}</div>
      {footer}
    </Modal>
  );
};

export default AuthModalShell;
