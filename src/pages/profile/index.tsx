import { useEffect, useState, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';

import PlayerLayout from '@/layout/PlayerLayout';
import SiteFooter from '@/components/player/SiteFooter';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AccountNav, {
  ACCOUNT_SECTIONS,
  isAccountSection,
  type AccountSection,
} from '@/components/profile/AccountNav';
import { ChevronLeftIcon } from '@/components/icons';
import ProfileSection from '@/components/profile/ProfileSection';
import StatisticSection from '@/components/profile/StatisticSection';
import PreferencesSection from '@/components/profile/PreferencesSection';
import ReferralSection from '@/components/profile/ReferralSection';
import SecuritySection from '@/components/profile/SecuritySection';
import VerificationSection from '@/components/profile/VerificationSection';
import TransactionsSection from '@/components/profile/TransactionsSection';
import RolloverSection from '@/components/profile/RolloverSection';
import HelpCentreSection from '@/components/profile/HelpCentreSection';
import ChangeAvatarModal from '@/components/modals/profile/ChangeAvatarModal';
import ChangeEmailModal from '@/components/modals/profile/ChangeEmailModal';
import AddPhoneModal from '@/components/modals/profile/AddPhoneModal';
import ChangeUsernameModal from '@/components/modals/profile/ChangeUsernameModal';
import ChangeTimezoneModal from '@/components/modals/profile/ChangeTimezoneModal';
import ChangePasswordModal from '@/components/modals/profile/ChangePasswordModal';
import TwoFactorModal from '@/components/modals/profile/TwoFactorModal';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import { useMe } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { DEFAULT_TIMEZONE } from '@/types/profile';
import Seo from '@/components/seo/Seo';

/**
 * The theme picker is not one of these: the design drops it from Preferences,
 * and it stays reachable from the top bar and the lobby rail, which own their
 * own copy of the modal.
 */
type ActiveModal =
  | 'avatar'
  | 'email'
  | 'verifyEmail'
  | 'phone'
  | 'verifyPhone'
  | 'username'
  | 'timezone'
  | 'password'
  | '2fa'
  | null;

/**
 * The account area: a section nav beside one panel of settings.
 *
 * The chosen section lives in the URL (`/profile?section=security`) via a
 * shallow replace, so it survives a refresh, is linkable, and answers the back
 * button — while staying one page with no extra server round-trip.
 *
 * The account itself comes from the shared UserProvider (one /users/me per
 * session); each modal writes through PATCH /users/me and then patches that
 * shared copy, so the top bar updates in step without a refetch.
 */
const ProfilePage: FC = () => {
  const { me, loading, error, refresh, updateMe } = useMe();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const { help_center: helpCentreOn, loaded: featuresLoaded } = usePlatformFeatures();
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [section, setSection] = useState<AccountSection>('profile');
  const closeModal = (): void => setActiveModal(null);

  // Restore the section from the URL once the router has the real query.
  useEffect(() => {
    if (router.isReady && isAccountSection(router.query.section)) {
      setSection(router.query.section);
    }
  }, [router.isReady, router.query.section]);

  // The Help Centre can be switched off in System config. Its section is then
  // not a place at all: a typed or bookmarked `?section=help` is dropped from
  // the URL and the profile shows instead. Waits for the flags to arrive —
  // before that they are optimistic defaults, not an answer.
  const helpBlocked = section === 'help' && !helpCentreOn;
  useEffect(() => {
    if (!featuresLoaded || helpCentreOn || !router.isReady) return;
    if (router.query.section === 'help') {
      void router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
    }
    setSection((current) => (current === 'help' ? 'profile' : current));
  }, [featuresLoaded, helpCentreOn, router]);

  const selectSection = (next: AccountSection): void => {
    setSection(next);
    void router.replace(
      { pathname: router.pathname, query: next === 'profile' ? {} : { section: next } },
      undefined,
      { shallow: true }
    );
  };

  const confirmLogout = (): void => {
    setLogoutOpen(false);
    logout();
    void router.push('/');
  };

  const body = (): ReactNode => {
    if (!me) {
      return null;
    }

    // Never render the Help Centre while it is off — or before we know whether
    // it is, when it was asked for by URL.
    if (section === 'help' && (helpBlocked || !featuresLoaded)) {
      return null;
    }

    switch (section) {
      case 'profile':
        return (
          <ProfileSection
            me={me}
            onToggle2FA={() => setActiveModal('2fa')}
            onChangeAvatar={() => setActiveModal('avatar')}
            onAddEmail={() => setActiveModal('email')}
            onVerifyEmail={() => setActiveModal('verifyEmail')}
            onAddPhone={() => setActiveModal('phone')}
            onVerifyPhone={() => setActiveModal('verifyPhone')}
          />
        );
      case 'statistic':
        return <StatisticSection />;
      case 'preferences':
        return (
          <PreferencesSection
            me={me}
            onChangeUsername={() => setActiveModal('username')}
            onChangeTimezone={() => setActiveModal('timezone')}
          />
        );
      case 'referral':
        return <ReferralSection />;
      case 'security':
        return (
          <SecuritySection
            email={me.email}
            twoFactorEnabled={me.two_factor_enabled}
            onChangePassword={() => setActiveModal('password')}
            onToggle2FA={() => setActiveModal('2fa')}
          />
        );
      case 'verification':
        return <VerificationSection me={me} onChangeEmail={() => setActiveModal('email')} />;
      case 'transactions':
        return <TransactionsSection />;
      case 'rollover':
        return <RolloverSection />;
      case 'help':
        return <HelpCentreSection />;
    }
  };

  return (
    <PlayerLayout>

      {/* 1544 is the account area's width in the design — 228 of rail, a 48px
          channel, and a 1268 panel. Wider than the lobby's `max-w-6xl`, and
          deliberately: every size inside is the design's own, so a narrower
          column makes the whole section read oversized. */}
      {/* The 1544 frame scales with everything else.
          As a fixed cap it quietly broke the gap either side of the account
          nav. At 1920 the design's 48 comes from two places — the shell's own
          20 of gap, plus the 28 of slack `mx-auto` leaves when a 1600 column
          is capped at 1544. On a 1251 laptop the column is only 1043, the cap
          never bites, the slack goes to zero, and the gap collapses to the
          shell's 13 while the nav-to-panel side stays at 31. Scaled, the cap
          is 1006 against a 1043 column, the slack is back in proportion, and
          both gaps land on 48 x --u together. */}
      {/* The design starts the area 40 under the bar — 24 more than the
          shell's own 16. */}
      <div className="@container mx-auto max-w-[calc(var(--u)*1544)] pb-2 lg:pt-[calc(var(--u)*24)]">
        {/* 228 of rail and a 48 channel, in `--u` — the shell's design pixel.
            This replaced a two-step ladder (180/20 below 1440, 228/48 above),
            and the step was the problem rather than the numbers: the shell's
            own rail is drawn in `--u` and comes down smoothly, so at 1270 it
            measured 172 while this column sat at 180 and the inner nav rendered
            wider than the outer one. Sharing the multiplier keeps the pair in
            proportion at every width instead of only at the two the ladder
            named. The panel still takes whatever is left. */}
        <div className="mb-5 mt-5 flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label={t('auth.back')}
            className="rl-glass-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#f0f1f5]"
          >
            <ChevronLeftIcon size={20} />
          </button>
          <h1 className="truncate text-[24px] font-medium leading-8 text-[#f0f1f5]">
            {t(ACCOUNT_SECTIONS.find(({ key }) => key === section)?.labelKey ?? 'account.profile')}
          </h1>
        </div>

        <div className="grid gap-4 lg:grid-cols-[calc(var(--u)*228)_minmax(0,1fr)] lg:gap-[calc(var(--u)*48)]">
          <div className="max-lg:hidden lg:contents">
            <AccountNav
              active={section}
              onSelect={selectSection}
              onLogout={() => setLogoutOpen(true)}
            />
          </div>

          {/* `@container` so the sections size themselves against the panel
              rather than the window. The two part company badly: the shelf and
              the rail take 492px before the panel starts, so a 1266 laptop
              leaves it 740 where the design drew 1268, and a window-based
              breakpoint reads "desktop" for both. */}
          {/* 30 of inset in the design (the panel runs 604–1872, its content
              634–1842), in `--u` with the rest. The phone keeps a flat 20 —
              below `lg` the unit is 1px and 30 is more than a 390 screen can
              spare on each side. */}
          {/* The design's panel has no wash of its own (its fill is switched
              off): the stage shows through, and the shared card polish draws
              the rim (see `index.css`). */}
          <div className="@container rl-panel min-w-0 p-0 [--panel-fill:transparent] max-lg:!border-0 max-lg:![box-shadow:none] max-lg:before:hidden lg:p-[calc(var(--u)*30)]">
            {!me ? (
              <div className="py-16 text-center">
                {error && !loading ? (
                  <>
                    <p className="text-sm text-white/60">{t('profile.loadFailed')}</p>
                    <button
                      type="button"
                      onClick={() => void refresh()}
                      className="rl-btn-gold mt-4 rounded-full px-4 py-2 text-xs font-semibold"
                    >
                      {t('profile.retry')}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-white/50">{t('common.loading')}</p>
                )}
              </div>
            ) : (
              body()
            )}
          </div>
        </div>
      </div>

      {/* The footer in the account column, 168 under the panel (8 of it the
          column's own foot). */}
      <div className="mx-auto mt-[89px] max-w-[1600px] lg:mt-[calc(var(--u)*160)] lg:max-w-[calc(var(--u)*1544)]">
        <SiteFooter />
      </div>

      {me && activeModal === 'avatar' && (
        <ChangeAvatarModal
          currentAvatarUrl={me.avatar_url ?? null}
          onClose={closeModal}
          onSaved={(avatar_url) => updateMe({ avatar_url })}
        />
      )}

      {me && activeModal === 'email' && (
        <ChangeEmailModal
          currentEmail={me.email}
          onClose={closeModal}
          onSaved={(email, verified) =>
            updateMe(
              verified
                ? { email, is_email_verified: true }
                : email === me.email
                  ? { email }
                  : { email, is_email_verified: false }
            )
          }
        />
      )}

      {me && me.email && activeModal === 'verifyEmail' && (
        <ChangeEmailModal
          currentEmail={me.email}
          verifyExisting
          onClose={closeModal}
          onSaved={(email) => updateMe({ email, is_email_verified: true })}
        />
      )}

      {me && activeModal === 'phone' && (
        <AddPhoneModal
          onClose={closeModal}
          onSaved={(mobile, country_code) => updateMe({ mobile, country_code })}
        />
      )}

      {me && me.mobile && activeModal === 'verifyPhone' && (
        <AddPhoneModal
          verifyExisting={{ mobile: me.mobile, countryCode: me.country_code ?? '' }}
          onClose={closeModal}
          onSaved={() => updateMe({ is_email_verified: true })}
        />
      )}

      {me && activeModal === 'username' && (
        <ChangeUsernameModal
          currentUsername={me.username ?? ''}
          onClose={closeModal}
          onSaved={(username) => updateMe({ username, username_changed_at: new Date().toISOString() })}
        />
      )}

      {me && activeModal === 'timezone' && (
        <ChangeTimezoneModal
          currentTimezone={me.timezone || DEFAULT_TIMEZONE}
          onClose={closeModal}
          onSaved={(timezone) => updateMe({ timezone })}
        />
      )}

      {activeModal === 'password' && me && (
        <ChangePasswordModal user={me} onClose={closeModal} />
      )}

      {me && activeModal === '2fa' && (
        <TwoFactorModal
          currentlyEnabled={me.two_factor_enabled}
          onClose={closeModal}
          onSaved={(enabled) => updateMe({ two_factor_enabled: enabled })}
        />
      )}

      {logoutOpen && (
        <LogoutConfirmModal onConfirm={confirmLogout} onCancel={() => setLogoutOpen(false)} />
      )}
    </PlayerLayout>
  );
};

const Profile: FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Seo title={t('profile.title')} />
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    </>
  );
};

export default Profile;
