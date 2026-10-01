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
import ThemeModal from '@/components/modals/profile/ThemeModal';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import apiService from '@/services/api';
import { useMe } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { DEFAULT_TIMEZONE } from '@/types/profile';
import type { Balance } from '@/types';

type ActiveModal = 'email' | 'username' | 'timezone' | 'password' | '2fa' | 'theme' | null;

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

  const [balance, setBalance] = useState<Balance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
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

  useEffect(() => {
    let active = true;
    apiService
      .get<Balance>('/balance/me')
      .then((res) => {
        if (active && res?.success && res.data) {
          setBalance(res.data);
        }
      })
      .catch(() => {
        /* the wallet rows show a dash */
      })
      .finally(() => {
        if (active) {
          setBalanceLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

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
        return (
          <ProfileSection
            me={me}
            onChangeEmail={() => setActiveModal('email')}
            onToggle2FA={() => setActiveModal('2fa')}
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
            onChangeTheme={() => setActiveModal('theme')}
          />
        );
      case 'referral':
        return <ReferralSection />;
      case 'security':
        return (
          <SecuritySection
            twoFactorEnabled={me.two_factor_enabled}
            onChangePassword={() => setActiveModal('password')}
            onToggle2FA={() => setActiveModal('2fa')}
          />
        );
      case 'verification':
        return <VerificationSection me={me} onChangeEmail={() => setActiveModal('email')} />;
      case 'transactions':
        return <TransactionsSection balance={balance} loading={balanceLoading} />;
      case 'help':
        return <HelpCentreSection />;
    }
  };

  return (
    <PlayerLayout>
      <Head>
        <title>{`${t('profile.title')} · ROLLUCK`}</title>
      </Head>

      <div className="mx-auto max-w-6xl pb-2">
        <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6">
          <AccountNav
            active={section}
            onSelect={selectSection}
            onLogout={() => setLogoutOpen(true)}
          />

          <div className="min-w-0 rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6">
            {!me ? (
              <div className="py-16 text-center">
                {error && !loading ? (
                  <>
                    <p className="text-sm text-slate-400">{t('profile.loadFailed')}</p>
                    <button
                      type="button"
                      onClick={() => void refresh()}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                    >
                      {t('profile.retry')}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">{t('common.loading')}</p>
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
            className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-[13px] font-semibold text-slate-200 hover:bg-slate-700 transition-colors lg:hidden"
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

      {me && activeModal === 'theme' && (
        <ThemeModal
          currentTheme={me.theme ?? 'dark'}
          onClose={closeModal}
          onSaved={(theme) => updateMe({ theme })}
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
