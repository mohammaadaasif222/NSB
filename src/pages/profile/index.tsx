import { useEffect, useState, type FC, type ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import PlayerLayout from '@/layout/PlayerLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import AccountNav, { isAccountSection, type AccountSection } from '@/components/profile/AccountNav';
import ProfileSection from '@/components/profile/ProfileSection';
import StatisticSection from '@/components/profile/StatisticSection';
import PreferencesSection from '@/components/profile/PreferencesSection';
import ReferralSection from '@/components/profile/ReferralSection';
import SecuritySection from '@/components/profile/SecuritySection';
import VerificationSection from '@/components/profile/VerificationSection';
import TransactionsSection from '@/components/profile/TransactionsSection';
import HelpCentreSection from '@/components/profile/HelpCentreSection';
import ChangeEmailModal from '@/components/modals/profile/ChangeEmailModal';
import ChangeUsernameModal from '@/components/modals/profile/ChangeUsernameModal';
import ChangeTimezoneModal from '@/components/modals/profile/ChangeTimezoneModal';
import ChangePasswordModal from '@/components/modals/profile/ChangePasswordModal';
import TwoFactorModal from '@/components/modals/profile/TwoFactorModal';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import { useMe } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { DEFAULT_TIMEZONE } from '@/types/profile';

/**
 * The theme picker is not one of these: the design drops it from Preferences,
 * and it stays reachable from the top bar and the lobby rail, which own their
 * own copy of the modal.
 */
type ActiveModal = 'email' | 'username' | 'timezone' | 'password' | '2fa' | null;

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

    switch (section) {
      case 'profile':
        return <ProfileSection me={me} onToggle2FA={() => setActiveModal('2fa')} />;
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
      case 'help':
        return <HelpCentreSection />;
    }
  };

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('profile.title')} · ROLLUCK`}</title>
      </Head>

      {/* 1544 is the account area's width in the design — 228 of rail, a 48px
          channel, and a 1268 panel. Wider than the lobby's `max-w-6xl`, and
          deliberately: every size inside is the design's own, so a narrower
          column makes the whole section read oversized. */}
      <div className="@container mx-auto max-w-[1544px] pb-2">
        {/* 228px is the rail's width in the design and 48px the channel it
            leaves — 276px of chrome, which the 1544 frame can afford and a
            laptop cannot. Below the width where the design's own measurements
            fit, both close up to 180 and 20: the rail still holds every label
            at its own type size, and the 76px it gives back goes to the panel,
            which is where the ledger and the KYC form were being squeezed.
            Sites of this shape budget about 190 for the same chrome. */}
        <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-5 @acct:lg:grid-cols-[228px_minmax(0,1fr)] @acct:lg:gap-12">
          <AccountNav
            active={section}
            onSelect={selectSection}
            onLogout={() => setLogoutOpen(true)}
          />

          {/* `@container` so the sections size themselves against the panel
              rather than the window. The two part company badly: the shelf and
              the rail take 492px before the panel starts, so a 1266 laptop
              leaves it 740 where the design drew 1268, and a window-based
              breakpoint reads "desktop" for both. */}
          <div className="@container rl-panel min-w-0 p-5 @acct:sm:p-7.5">
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

          {/* The rail's log-out is desktop-only; phones get it under the panel. */}
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="rl-glass rl-glass-hover rounded-2xl px-3 py-2.5 text-[13px] font-medium text-white/70 lg:hidden"
          >
            {t('account.logout')}
          </button>
        </div>
      </div>

      {me && activeModal === 'email' && (
        <ChangeEmailModal
          currentEmail={me.email}
          onClose={closeModal}
          onSaved={(email) => updateMe({ email })}
        />
      )}

      {me && activeModal === 'username' && (
        <ChangeUsernameModal
          currentUsername={me.username ?? ''}
          onClose={closeModal}
          onSaved={(username) => updateMe({ username })}
        />
      )}

      {me && activeModal === 'timezone' && (
        <ChangeTimezoneModal
          currentTimezone={me.timezone || DEFAULT_TIMEZONE}
          onClose={closeModal}
          onSaved={(timezone) => updateMe({ timezone })}
        />
      )}

      {activeModal === 'password' && <ChangePasswordModal onClose={closeModal} />}

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

const Profile: FC = () => (
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
);

export default Profile;
