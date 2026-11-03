import { useEffect, useMemo, useRef, useState, type FC } from 'react';

import GlassDialog from '@/components/ui/GlassDialog';
import WalletModal from '@/components/wallet/WalletModal';
import { STAGE_LABEL_KEYS, stageHeadline, stageTerms } from '@/components/bonus/stageCopy';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { useBonuses } from '@/hooks/useBonuses';
import { donePostSignup, takePostSignup } from '@/lib/postSignup';
import { analytics } from '@/services/analytics';

/** How long to wait for the bonus offer before showing the popup without it. */
const OFFER_WAIT_MS = 3000;

const BUTTON =
  'flex h-12 w-full items-center justify-center rounded-full px-6 text-[16px] font-semibold';

interface DialogProps {
  onExplore: () => void;
  onDeposit: () => void;
  onDismiss: () => void;
}

/**
 * Mounted only while the popup is up, so the bonuses request is made for a new
 * player and not for every signed-in page view. Waits briefly for the offer so
 * the card does not pop in after the dialog has opened.
 */
const WelcomeDialog: FC<DialogProps> = ({ onExplore, onDeposit, onDismiss }) => {
  const { t, locale } = useTranslation();
  const { bonuses: bonusesOn } = usePlatformFeatures();
  const { summary, error } = useBonuses();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), OFFER_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const offer = useMemo(() => {
    if (!bonusesOn || !summary?.enabled || !summary.welcome_enabled) return null;
    return (
      summary.welcome
        .filter((stage) => stage.status === 'LOCKED' || stage.status === 'AVAILABLE')
        .sort((a, b) => a.sequence - b.sequence)[0] ?? null
    );
  }, [bonusesOn, summary]);

  const ready = !bonusesOn || !!summary || !!error || waited;
  const hasOffer = offer !== null;

  const shown = useRef(false);
  useEffect(() => {
    if (!ready || shown.current) return;
    shown.current = true;
    analytics.welcome.shown(hasOffer);
  }, [ready, hasOffer]);

  if (!ready) return null;

  const currency = summary?.currency ?? 'USD';
  const labelKey = offer ? STAGE_LABEL_KEYS[offer.sequence] : undefined;
  const terms = offer ? stageTerms(offer, currency, t) : [];

  return (
    <GlassDialog
      open
      onClose={() => {
        analytics.welcome.dismissed(hasOffer);
        onDismiss();
      }}
      titleId="post-signup-title"
      title={t('postSignup.title')}
      titleVariant="title"
      phoneSheet="fit"
      className="w-full p-6 sm:w-[min(520px,92vw)] sm:p-8"
    >
      <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="mt-4 space-y-5 text-center">
        <p className="text-[16px] leading-6 text-[#9da2b4]">
          {hasOffer ? t('postSignup.offerSubtitle') : t('postSignup.subtitle')}
        </p>

        {offer && (
          <div className="rl-liquid rounded-[24px] px-5 py-5">
            <p className="text-[36px] leading-10 font-semibold tracking-[-0.02em] text-[#f9d028]">
              {stageHeadline(offer, currency, t)}
            </p>
            <p className="mt-2 text-[14px] leading-5 text-[#f0f1f5]">
              {labelKey ? t(labelKey) : offer.label}
            </p>
            {terms.length > 0 && (
              <p className="mt-1.5 text-[12px] leading-4 text-white/48">{terms.join(' · ')}</p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              analytics.welcome.deposit(hasOffer);
              onDeposit();
            }}
            className={`${BUTTON} rl-btn-gold`}
          >
            {hasOffer ? t('postSignup.depositBonus') : t('postSignup.deposit')}
          </button>
          <button
            type="button"
            onClick={() => {
              analytics.welcome.explored(hasOffer);
              onExplore();
            }}
            className={`${BUTTON} rl-btn-ghost font-medium`}
          >
            {t('postSignup.explore')}
          </button>
        </div>
      </div>
    </GlassDialog>
  );
};

/**
 * The popup right after a new account is created: look around, or deposit now.
 * With a welcome bonus on offer it carries the first stage — what it is worth
 * and what it asks — and Deposit leads to it; without one it is the plain pair.
 *
 * Shown once per signup, on whichever route created the account. The sign-up
 * flows only leave a flag (see lib/postSignup); this shows it once the session
 * is there. The login pop-up stands aside for it.
 */
const PostSignupPopup: FC = () => {
  const { token, hydrated } = useAuth();
  const [phase, setPhase] = useState<'idle' | 'welcome' | 'wallet'>('idle');

  useEffect(() => {
    if (!hydrated || !token) return;
    if (takePostSignup()) setPhase('welcome');
  }, [hydrated, token]);

  const finish = (): void => {
    donePostSignup();
    setPhase('idle');
  };

  return (
    <>
      {phase === 'welcome' && (
        <WelcomeDialog onExplore={finish} onDeposit={() => setPhase('wallet')} onDismiss={finish} />
      )}
      {phase === 'wallet' && <WalletModal open onClose={finish} initialTab="deposit" />}
    </>
  );
};

export default PostSignupPopup;
