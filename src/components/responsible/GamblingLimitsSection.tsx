import { useCallback, useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import SetLimitModal from '@/components/modals/responsible/SetLimitModal';
import { getLimits, setLimit } from '@/services/responsible';
import type { LimitKind, LimitPeriod, LimitSet } from '@/types/responsible';

/**
 * Gambling limits.
 *
 * The design draws this as a read and a single call to action: what a limit
 * does, when a removal takes effect, when an active one resets, and one button.
 * It replaced a manager that listed every limit with its usage and a way to
 * remove it — see the note on the button below for what that costs.
 *
 * The copy is the design's, including the em dash in the second line.
 */
const PARAGRAPHS: readonly string[] = [
  'Take control of your play by setting loss or wagering limits. You can cap the maximum amount you lose or wager over a daily, weekly, monthly, or quarterly period.',
  'Removing a limit — takes effect at 00:00 (UTC+0) following a cooling-off period of at least 24 hours.',
  'Active limits reset automatically at 00:00 (UTC+0) at the end of each period.',
];

const GamblingLimitsSection: FC = () => {
  const { t } = useTranslation();
  const { token, hydrated } = useAuth();

  const [limits, setLimits] = useState<LimitSet | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Only a signed-in player has limits to read; a visitor just reads the copy.
  useEffect(() => {
    if (!token) return;
    let alive = true;
    void getLimits().then((l) => {
      if (alive) setLimits(l);
    });
    return () => {
      alive = false;
    };
  }, [token]);

  const submit = useCallback(
    async (kind: LimitKind, period: LimitPeriod, amount: string): Promise<void> => {
      setSaving(true);
      await setLimit(kind, period, amount);
      setLimits(await getLimits());
      setSaving(false);
      setOpen(false);
    },
    []
  );

  /* 270×56 with 34 of radius — the design's own button, and the same gold the
     Affiliate page's Change and Collect are cut from. */
  const BUTTON =
    'rl-btn-gold flex h-14 items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium sm:w-67.5';

  return (
    <div>
      <h2 className="rl-h-section">{t('rg.limitsTitle')}</h2>

      {/* White, not the Gray 4 the Self-Assessment page uses for the same size
          of copy — the design inks this one at full strength. */}
      <div className="mt-5 space-y-7 text-[18px] leading-7 text-white 2xl:text-[20px]">
        {PARAGRAPHS.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="mt-8">
        {hydrated && !token ? (
          // Nothing to set without an account, so the button goes to sign-in
          // rather than opening a form that cannot save.
          <Link href="/auth/login" className={BUTTON}>
            {t('rg.limitsSet')}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!hydrated}
            className={BUTTON}
          >
            {t('rg.limitsSet')}
          </button>
        )}
      </div>

      {open && (
        <SetLimitModal
          limits={limits}
          onClose={() => setOpen(false)}
          onSubmit={(kind, period, amount) => void submit(kind, period, amount)}
          saving={saving}
        />
      )}
    </div>
  );
};

export default GamblingLimitsSection;
