import { useCallback, useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import SetLimitModal from '@/components/modals/responsible/SetLimitModal';
import { getLimits, setLimit } from '@/services/responsible';
import type { LimitKind, LimitPeriod, LimitSet } from '@/types/responsible';
import type { TranslationKey } from '@/i18n/locales';
import { blocksOf, type HelpEntry } from '@/components/responsible/helpContent';
import { toast } from 'react-toastify';
import { apiErrorMessage } from '@/lib/apiError';

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
const PARAGRAPHS: readonly TranslationKey[] = [
  'rgc.limitsPara1',
  'rgc.limitsPara2',
  'rgc.limitsPara3',
];

const GamblingLimitsSection: FC<{ entry?: HelpEntry }> = ({ entry }) => {
  const { t } = useTranslation();
  const paragraphs = entry ? blocksOf(entry.content).map((lines) => lines.join('\n')) : null;
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
      try {
        await setLimit(kind, period, amount);
        setLimits(await getLimits());
        setOpen(false);
      } catch (err) {
        toast.error(apiErrorMessage(err, 'Could not save your limit'));
      } finally {
        setSaving(false);
      }
    },
    []
  );

  /* 270×56 with 34 of radius — the design's own button, and the same gold the
     Referral page's Change and Collect are cut from. */
  const BUTTON =
    'rl-btn-gold flex h-10 w-full items-center justify-center rounded-[34px] px-2 text-[14px] leading-5 font-medium sm:h-14 sm:w-67.5 sm:text-[18px] sm:leading-7';

  return (
    <div>
      <h2 className="text-[16px] leading-6 font-medium text-[#f0f1f5] sm:rl-h-section">
        {entry ? entry.title : t('rgc.limitsTitle')}
      </h2>

      {/* White, not the Gray 4 the Self-Assessment page uses for the same size
          of copy — the design inks this one at full strength. */}
      <div className="mt-3 space-y-5 text-[12px] leading-5 text-[#9da2b4] sm:mt-5 sm:space-y-7 sm:text-[18px] sm:leading-7 sm:text-white 2xl:text-[20px]">
        {paragraphs
          ? paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))
          : PARAGRAPHS.map((p) => <p key={p}>{t(p)}</p>)}
      </div>

      <div className="mt-5 sm:mt-8">
        {hydrated && !token ? (
          // Nothing to set without an account, so the button goes to sign-in
          // rather than opening a form that cannot save.
          <Link href="/auth/login" className={BUTTON}>
            {t('rgc.limitsSet')}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={!hydrated}
            className={BUTTON}
          >
            {t('rgc.limitsSet')}
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
