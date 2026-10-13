import type { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/footer/logo.svg';
import LanguagePicker from '@/components/LanguagePicker';
import { useTranslation } from '@/context/I18nContext';
import { BackToTopIcon } from '@/components/player/footer/footerIcons';
import { SOCIALS } from '@/components/player/footer/footerContent';

/**
 * Wordmark, socials, and the two controls.
 *
 * The three-track grid is what puts the socials on the page's centre line
 * rather than on the centre of what the wordmark leaves over — the design
 * centres them on the frame, and the wordmark is twice the width of the
 * controls, so `justify-between` would land them a quarter of a screen to the
 * right. Equal outer tracks fix that at any width; below the breakpoint the
 * three stack and centre instead.
 */
const FooterTopBar: FC = () => {
  const { t } = useTranslation();
  const toTop = (): void =>
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });

  return (
    <div className="flex flex-col items-center gap-6 @foot:grid @foot:grid-cols-[1fr_auto_1fr] @foot:items-center @foot:gap-6">
      <Link
        href="/"
        aria-label="ROLLUCK"
        className="block w-full max-w-110 @foot:justify-self-start"
      >
        <Image src={logo} alt="ROLLUCK" unoptimized className="h-auto w-full" priority={false} />
      </Link>

      <div className="flex items-center gap-3">
        {SOCIALS.map(({ Mark, label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className="rl-pill rl-pill-hover flex h-12 w-12 items-center justify-center rounded-full"
          >
            <Mark />
          </a>
        ))}
      </div>

      <div className="flex items-center gap-4.5 @foot:justify-self-end">
        <LanguagePicker footer dropUp />
        <button
          type="button"
          onClick={toTop}
          aria-label={t('lobby.footer.backToTop')}
          title={t('lobby.footer.backToTop')}
          className="rl-pill rl-pill-hover flex h-12 w-12 items-center justify-center rounded-full text-[#f0f1f5] hover:text-white"
        >
          <BackToTopIcon />
        </button>
      </div>
    </div>
  );
};

export default FooterTopBar;
