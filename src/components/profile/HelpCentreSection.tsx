import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { FieldGroup, SettingRow } from '@/components/profile/SectionShell';
import { LifeBuoyIcon, ShieldIcon, SparklesIcon } from '@/components/icons';

const SUPPORT_EMAIL = 'support@rolluck.com';

/** The pill used for a help-centre row's action. */
const RowLink: FC<{ href: string; children: string; external?: boolean }> = ({
  href,
  children,
  external,
}) =>
  external ? (
    <a
      href={href}
      className="whitespace-nowrap rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
    >
      {children}
    </a>
  ) : (
    <Link
      href={href}
      className="whitespace-nowrap rounded-full bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
    >
      {children}
    </Link>
  );

/**
 * Where to go when something is wrong. Every row here points at something that
 * exists — the support mailbox in the rail's footer, and the two policy pages.
 */
const HelpCentreSection: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <FieldGroup label={t('profile.helpCentre')}>
        <SettingRow
          icon={<LifeBuoyIcon size={15} />}
          title={t('nav.support')}
          detail={SUPPORT_EMAIL}
          action={
            <RowLink href={`mailto:${SUPPORT_EMAIL}`} external>
              {t('profile.contactSupport')}
            </RowLink>
          }
        />
        <SettingRow
          icon={<ShieldIcon size={15} />}
          title={t('nav.responsiblePlay')}
          action={<RowLink href="/responsible-play">{t('dash.viewAll')}</RowLink>}
        />
        <SettingRow
          icon={<SparklesIcon size={15} />}
          title={t('nav.rolluckOath')}
          action={<RowLink href="/rolluck-oath">{t('dash.viewAll')}</RowLink>}
        />
      </FieldGroup>
    </div>
  );
};

export default HelpCentreSection;
