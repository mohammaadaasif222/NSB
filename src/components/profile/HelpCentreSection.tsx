import type { FC } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { FieldGroup, IconTile, SettingRow } from '@/components/profile/SectionShell';
import { LifeBuoyIcon, ShieldIcon, SparklesIcon } from '@/components/icons';

const SUPPORT_EMAIL = 'support@xyzlife.top';

/* The rows were handing `SettingRow` a bare 15px glyph where every other
   section gives it a 38px tile, so this one sat a third of the size of the
   rest of the account area. The tile scales itself; the glyph inside has to
   be told to. */
const GLYPH = 'h-[calc(var(--u)*20)] w-[calc(var(--u)*20)]';

/**
 * The pill used for a help-centre row's action.
 *
 * Was a blue button beside a slate one — the palette this app shipped before
 * the design, and the only two left in the account area. Both now carry the
 * same glass the rest of the section does, and both are sized in `--u` so they
 * come down with the row around them.
 */
const PILL =
  'rounded-full px-[calc(var(--u)*14)] py-[calc(var(--u)*6)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[1.5] font-medium whitespace-nowrap transition-colors';

const RowLink: FC<{ href: string; children: string; external?: boolean }> = ({
  href,
  children,
  external,
}) =>
  external ? (
    <a href={href} className={`rl-btn-gold ${PILL}`}>
      {children}
    </a>
  ) : (
    <Link href={href} className={`rl-btn-ghost ${PILL}`}>
      {children}
    </Link>
  );

/**
 * Where to go when something is wrong. Every row here points at something that
 * exists — the support mailbox in the rail's footer, and the two policy pages.
 */
const HelpCentreSection: FC = () => {
  const { t } = useTranslation();
  const { responsible_gambling: responsibleOn } = usePlatformFeatures();

  return (
    <div className="space-y-[calc(var(--u)*30)]">
      <FieldGroup label={t('profile.helpCentre')}>
        <SettingRow
          icon={
            <IconTile>
              <LifeBuoyIcon size={20} className={GLYPH} />
            </IconTile>
          }
          title={t('nav.support')}
          detail={SUPPORT_EMAIL}
          action={
            <RowLink href={`mailto:${SUPPORT_EMAIL}`} external>
              {t('profile.contactSupport')}
            </RowLink>
          }
        />
        {responsibleOn && (
          <SettingRow
            icon={
              <IconTile>
                <ShieldIcon size={20} className={GLYPH} />
              </IconTile>
            }
            title={t('nav.responsiblePlay')}
            action={<RowLink href="/responsible-gambling">{t('dash.viewAll')}</RowLink>}
          />
        )}
        <SettingRow
          icon={
            <IconTile>
              <SparklesIcon size={20} className={GLYPH} />
            </IconTile>
          }
          title={t('nav.rolluckOath')}
          action={<RowLink href="/rolluck-oath">{t('dash.viewAll')}</RowLink>}
        />
      </FieldGroup>
    </div>
  );
};

export default HelpCentreSection;
