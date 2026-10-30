import type { FC, ReactNode } from 'react';
import { useTranslation } from '@/context/I18nContext';
import Modal from '@/components/ui/Modal';
import ModalHeader from '@/components/ui/ModalHeader';

interface AuthModalShellProps {
  /** Unique per modal: the heading id the dialog is labelled by. */
  titleId: string;
  title: string;
  /** The title on a phone, where its design words it differently. */
  phoneTitle?: string;
  /** First screen of a journey: large bold title, no back button. */
  hero?: boolean;
  /** A short chooser step (Register with): a 24px title rather than the step size. */
  section?: boolean;
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
  phoneTitle,
  hero = false,
  section = false,
  onBack,
  onClose,
  footer,
  children,
}) => {
  const { t } = useTranslation();

  return (
    // A phone draws every step as a sheet from the screen's foot, as tall as
    // the step, its top corners at the design's 34.
    <Modal
      open
      onClose={onClose}
      labelledBy={titleId}
      phoneSheet="fit"
      brand
      // The design's phone insets: the rail 20 from the top and 16 in, the
      // body 3 further in, 20 left at the foot.
      className="max-w-[480px] px-4 pb-5 pt-5 max-sm:!rounded-t-[34px] sm:p-4"
    >
      <ModalHeader
        id={titleId}
        title={title}
        phoneTitle={phoneTitle}
        variant={hero ? 'hero' : section ? 'section' : 'compact'}
        onClose={onClose}
        closeLabel={t('registerModal.close')}
        onBack={hero ? undefined : onBack}
        backLabel={t('auth.back')}
        bigClose
        titleClassName={
          hero
            ? 'max-sm:!text-[36px] max-sm:!font-semibold max-sm:!leading-[44px]'
            : section
              ? ''
              : 'max-sm:!text-[18px] max-sm:!leading-7'
        }
      />
      <div className="relative z-10 px-px pt-[26px] sm:px-8 sm:pb-2 sm:pt-7">{children}</div>
      {footer}
    </Modal>
  );
};

export default AuthModalShell;
