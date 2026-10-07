import { useState, type FC } from 'react';

import WalletModal from '@/components/wallet/WalletModal';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { useAuthModal } from '@/context/AuthModalContext';
import type { TranslationKey } from '@/i18n/locales';

/**
 * The three deposit matches, in the order the design lists them.
 *
 * The percentages are the design's own and nothing serves them yet. The bonus
 * module has DEPOSIT_MATCH campaigns with a `match_percentage`, but nothing
 * records which of a player's deposits a campaign applies to, so first /
 * second / third cannot be derived from the API. Replace this constant once
 * the welcome pack is a real campaign set rather than a marketing promise.
 */
const TIERS: { percent: string; label: TranslationKey }[] = [
  { percent: '150%', label: 'bonus.deposit1' },
  { percent: '180%', label: 'bonus.deposit2' },
  { percent: '200%', label: 'bonus.deposit3' },
];

/**
 * The welcome pack, across the top of the Bonuses page.
 *
 * Carries the page's h1 — the design replaces the plain "Bonuses" title with
 * this panel, and a page still needs one top-level heading.
 *
 * Claim Now takes a visitor to registration and a player to the deposit tab: a
 * deposit match has nothing to claim on its own, it is applied to the next
 * deposit, so the button opens the thing that actually triggers it. The wallet
 * dialog is mounted here rather than reached through the header, which keeps
 * its own copy in local state.
 */
const WelcomePackPanel: FC = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { openRegister } = useAuthModal();
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <section className="rl-glass-deep rounded-[24px] px-5 pb-6 pt-7 lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*33)] lg:pb-[calc(var(--u)*26)] lg:pt-[calc(var(--u)*32)]">
      <h1 className="text-center text-[24px] font-semibold leading-8 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(16px,calc(var(--u)*32))] lg:leading-[calc(var(--u)*40)]">
        {t('bonus.welcomeTitle')}
      </h1>
      <p className="mt-2 text-center text-[14px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*8)] lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]">
        {t('bonus.welcomeSubtitle')}
      </p>

      {/* 481 wide, 20 apart — the design's three across inside the panel. */}
      <ul className="mt-6 grid gap-4 sm:grid-cols-3 lg:mt-[calc(var(--u)*24)] lg:gap-[calc(var(--u)*20)]">
        {TIERS.map((tier) => (
          <li
            key={tier.percent}
            className="rl-liquid rounded-[24px] px-5 pb-5 pt-6 text-center lg:rounded-[calc(var(--u)*34)] lg:px-[calc(var(--u)*24)] lg:pb-[calc(var(--u)*21)] lg:pt-[calc(var(--u)*24)]"
          >
            <p className="text-[32px] font-semibold leading-10 tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(20px,calc(var(--u)*44))] lg:leading-[calc(var(--u)*52)]">
              {tier.percent}
            </p>
            <p className="mt-3 text-[13px] leading-5 text-[#9da2b4] lg:mt-[calc(var(--u)*16)] lg:text-[length:max(10px,calc(var(--u)*14))] lg:leading-[calc(var(--u)*20)]">
              {t(tier.label)}
            </p>
            <button
              type="button"
              onClick={() => (token ? setWalletOpen(true) : openRegister())}
              className="rl-btn-ghost mt-4 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-medium lg:mt-[calc(var(--u)*16)] lg:h-[calc(var(--u)*56)] lg:text-[length:max(12px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]"
            >
              {t('bonus.claimNow')}
            </button>
          </li>
        ))}
      </ul>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} initialTab="deposit" />
    </section>
  );
};

export default WelcomePackPanel;
