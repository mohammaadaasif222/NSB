import type { FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { ChevronRightIcon } from '@/components/icons';
import { PASSWORD_MIN_LENGTH, PASSWORD_RULES } from '@/constants/auth';

interface PasswordRulesProps {
  id: string;
  password: string;
  visible: boolean;
}

/**
 * The "Password must include" checklist. Each rule turns green as it is met.
 *
 * On large screens it floats outside the modal, to the left of the field it
 * describes (the parent must be `relative`); below that there is no room
 * beside the card, so it drops into the flow under the field instead.
 */
const PasswordRules: FC<PasswordRulesProps> = ({ id, password, visible }) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div
      id={id}
      role="status"
      className="mt-2 rounded-2xl border border-white/15 bg-[#17181c]/95 px-4 py-3 text-[12px] leading-5 text-white/85 backdrop-blur-xl lg:absolute lg:end-[calc(100%+22px)] lg:top-1/2 lg:mt-0 lg:w-[320px] lg:-translate-y-1/2 lg:text-[11px] lg:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
    >
      <p className="mb-1 text-white/70">{t('registerModal.rulesTitle')}</p>
      <ul className="space-y-0.5">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li
              key={rule.id}
              className={`flex gap-2 transition-colors ${met ? 'text-[var(--rl-green)]' : ''}`}
            >
              <span aria-hidden="true">•</span>
              <span>
                {t(rule.labelKey, { min: PASSWORD_MIN_LENGTH })}
                <span className="sr-only">{met ? ' ✓' : ''}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {/* The little pointer disc on the tooltip's edge, facing the field. */}
      <span
        aria-hidden="true"
        className="absolute -end-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#17181c] text-white/80 lg:flex rtl:rotate-180"
      >
        <ChevronRightIcon size={14} />
      </span>
    </div>
  );
};

export default PasswordRules;
