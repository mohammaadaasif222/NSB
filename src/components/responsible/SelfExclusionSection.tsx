import { useCallback, useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import { EXCLUSION_OPTIONS, type ExclusionOption } from '@/components/responsible/rgContent';
import { RgCard, SectionIntro, Stat, SupportList } from '@/components/responsible/RgShell';
import { formatDate } from '@/components/responsible/rgFormat';
import SelfExclusionConfirmModal from '@/components/modals/responsible/SelfExclusionConfirmModal';
import { getSelfExclusion, startSelfExclusion } from '@/services/responsible';
import type { SelfExclusionState } from '@/types/responsible';
import { CheckIcon, PauseIcon } from '@/components/icons';

/**
 * Self-exclusion.
 *
 * The heaviest control on the site. The design lays it out as a read, two
 * labelled steps, a consent tick and one button.
 *
 * WHAT THE DESIGN DOES NOT SAY: both step cards are drawn empty — 236px boxes
 * with a title and nothing in them. The titles are the only instruction, so
 * Step 1 carries the 24-hour cooldown they name and Step 2 the longer periods
 * the product already defines. That content is inference, not the design, and
 * should be replaced when those cards are finished.
 */
const COOLDOWN_VALUE = '24h';

const SelfExclusionSection: FC = () => {
  const { t, locale } = useTranslation();
  const { token, hydrated } = useAuth();
  const [state, setState] = useState<SelfExclusionState | null>(null);
  const [selected, setSelected] = useState<ExclusionOption | null>(null);
  const [consented, setConsented] = useState(false);
  const [confirming, setConfirming] = useState<ExclusionOption | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    void getSelfExclusion().then((s) => {
      if (alive) setState(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  const confirm = useCallback(async (): Promise<void> => {
    if (!confirming) return;
    setSaving(true);
    const next = await startSelfExclusion(confirming.value);
    setState(next);
    setSaving(false);
    setConfirming(null);
    setSelected(null);
  }, [confirming]);

  if (!state) {
    return <p className="text-sm text-[#9da2b4]">{t('common.loading')}</p>;
  }

  /* ── Already excluded ───────────────────────────────────────────────
     Not in the design, and kept: a player who is already excluded must not
     be shown a form to exclude themselves again, and the independent services
     are the only thing worth putting in front of them. */
  if (state.active) {
    const option = EXCLUSION_OPTIONS.find((o) => o.value === state.period);

    return (
      <div className="space-y-6">
        <SectionIntro title={t('rg.exclusionActiveTitle')} />

        <RgCard>
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e33827]/12 text-[#e33827]">
              <PauseIcon size={20} strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base leading-6 font-medium text-[#f0f1f5]">
                {t('rg.exclusionActiveHeading')}
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-[#9da2b4]">
                {t('rg.exclusionActiveBody')}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-5">
            <Stat label={t('rg.exclusionPeriod')} value={option?.label ?? '—'} />
            <Stat
              label={t('rg.exclusionEnds')}
              value={state.endsAt ? formatDate(state.endsAt, locale) : t('rg.exclusionNever')}
            />
          </div>
        </RgCard>

        <div>
          <h3 className="rl-h-card mb-3 text-[#f0f1f5]">{t('rg.supportTitle')}</h3>
          <SupportList />
        </div>
      </div>
    );
  }

  const cooldown = EXCLUSION_OPTIONS.find((o) => o.value === COOLDOWN_VALUE);
  const longer = EXCLUSION_OPTIONS.filter((o) => o.value !== COOLDOWN_VALUE);

  /* 1206×236, white 5% on a 0.2 edge at 34 of radius — the design's step card.
     The 236 is kept as a floor rather than dropped to fit: the design draws
     these boxes at that height with nothing in them, so the room is where the
     finished content is meant to go. */
  const CARD = 'rl-field-card rounded-[34px] border border-white/20 p-6 sm:min-h-[236px] sm:p-7.5';
  const STEP_TITLE = 'text-[18px] leading-7 text-[#f0f1f5] 2xl:text-[20px]';

  const pick = (o: ExclusionOption): void => setSelected(selected?.value === o.value ? null : o);

  const optionClass = (o: ExclusionOption): string =>
    `rounded-full px-4 py-2 text-[15px] leading-6 transition-colors ${
      selected?.value === o.value
        ? 'rl-chip-active text-[#ffe779]'
        : 'rl-chip text-[#9da2b4] hover:text-white'
    }`;

  return (
    <div>
      <h2 className="rl-h-section">{t('rg.exclusionTitle')}</h2>

      <div className="mt-5 space-y-7 text-[18px] leading-7 text-[#9da2b4] 2xl:text-[20px]">
        <p>{t('rg.exclusionLead')}</p>
        <p>{t('rg.exclusionEmailNote')}</p>
      </div>

      {/* ── Step 1 ─────────────────────────────────────────────────────── */}
      <div className={`${CARD} mt-7.25`}>
        <h3 className={STEP_TITLE}>{t('rg.exclusionStep1')}</h3>

        {cooldown && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => pick(cooldown)} className={optionClass(cooldown)}>
              {cooldown.label}
            </button>
            <p className="text-sm leading-5 text-[#9da2b4]">{cooldown.note}</p>
          </div>
        )}
      </div>

      {/* ── Step 2 ─────────────────────────────────────────────────────── */}
      <div className={`${CARD} mt-4.75`}>
        <h3 className={STEP_TITLE}>{t('rg.exclusionStep2')}</h3>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {longer.map((o) => (
            <button key={o.value} type="button" onClick={() => pick(o)} className={optionClass(o)}>
              {o.label}
            </button>
          ))}
        </div>

        {selected && selected.value !== COOLDOWN_VALUE && (
          <p className="mt-4 text-sm leading-5 text-[#9da2b4]">{selected.note}</p>
        )}
      </div>

      {/* ── Consent ────────────────────────────────────────────────────── */}
      <label className="mt-3.75 flex cursor-pointer items-center gap-1">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`flex h-8.75 w-8.75 shrink-0 items-center justify-center rounded-full transition-colors ${
            consented ? 'bg-[#f0f1f5] text-[#07080a]' : 'border border-white/25 text-transparent'
          }`}
        >
          <CheckIcon size={18} />
        </span>
        <span className="text-[18px] leading-7 text-[#f0f1f5] 2xl:text-[20px]">
          {t('rg.exclusionConsent')}
        </span>
      </label>

      {hydrated && !token ? (
        <>
          <Link
            href="/auth/login"
            className="rl-btn-gold mt-6.5 flex h-14 items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium sm:w-67.5"
          >
            {t('rg.exclusionContinueAction')}
          </Link>
          {/* The one thing the old sign-in gate said that is worth keeping:
              being locked out IS the feature working. */}
          <p className="mt-3 max-w-2xl text-sm leading-5 text-[#9da2b4]">
            {t('rg.signInExclusion')}
          </p>
        </>
      ) : (
        <button
          type="button"
          onClick={() => selected && setConfirming(selected)}
          disabled={!selected || !consented || !hydrated}
          className="rl-btn-gold mt-6.5 flex h-14 items-center justify-center rounded-[34px] px-2 text-[18px] leading-7 font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:w-67.5"
        >
          {t('rg.exclusionContinueAction')}
        </button>
      )}

      {confirming && (
        <SelfExclusionConfirmModal
          option={confirming}
          onClose={() => setConfirming(null)}
          onConfirm={() => void confirm()}
          saving={saving}
        />
      )}
    </div>
  );
};

export default SelfExclusionSection;
