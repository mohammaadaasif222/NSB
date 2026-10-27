import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '@/context/AuthContext';
import { captureReferral } from '@/lib/referralCapture';
import { captureAffiliateTag } from '@/lib/affiliateCapture';
import { recordReferralVisit } from '@/services/referral';
// Imported statically, not via next/dynamic: Login and Register are the
// primary calls to action, and a lazy chunk that never resolves leaves the
// buttons silently doing nothing.
import RegisterModal, { type RegisterPrefill } from '@/components/auth/register/RegisterModal';
import LoginModal, { type LoginEntry } from '@/components/auth/login/LoginModal';

/**
 * Opens the auth modals from anywhere: `openLogin()`, `openRegister()`.
 *
 * They are also reachable by URL — `?auth=login`, `?auth=register` (optionally
 * with `&mobile=` or `&method=email`) or `?auth=forgot` opens the matching
 * modal on whatever page the link points at. The old /auth/* pages redirect to
 * these, so bookmarks and shared links keep working.
 *
 * `?ref=CODE` is a referral link: the code is kept for signup and a signed-out
 * visitor is shown the register modal.
 *
 * `?stag=` is an Affilka affiliate link: the stag is kept for signup and the
 * page is left as it is (the stag stays in the URL, as Affilka expects).
 */

interface AuthModalContextType {
  openLogin: (entry?: LoginEntry) => void;
  openRegister: (prefill?: RegisterPrefill) => void;
  closeAuthModal: () => void;
}

type ModalState =
  { view: 'login'; entry: LoginEntry } | { view: 'register'; prefill?: RegisterPrefill } | null;

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

/**
 * Read a deep link's signup prefill, ignoring anything it should not be able
 * to set. A number implies the mobile form; `method=email` opens the email one
 * directly. Nothing else is honoured — this is query-string input.
 */
const registerPrefill = (
  mobile: string | string[] | undefined,
  method: string | string[] | undefined
): RegisterPrefill | undefined => {
  if (typeof mobile === 'string' && mobile) return { mobile };
  if (method === 'email' || method === 'mobile') return { method };
  return undefined;
};

export const AuthModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { token, hydrated } = useAuth();
  const [modal, setModal] = useState<ModalState>(null);

  const openLogin = useCallback((entry: LoginEntry = 'method'): void => {
    setModal({ view: 'login', entry });
  }, []);

  const openRegister = useCallback((prefill?: RegisterPrefill): void => {
    setModal({ view: 'register', prefill });
  }, []);

  const closeAuthModal = useCallback((): void => setModal(null), []);

  // Deep link: open from the query string, then drop it so a refresh or a
  // shared URL copied later does not reopen the modal.
  useEffect(() => {
    const { auth, mobile, method, ref, ...rest } = router.query;
    if (!router.isReady || !hydrated) return;
    if (typeof auth !== 'string' && typeof ref !== 'string') return;

    if (typeof ref === 'string' && !token && captureReferral(ref)) {
      void recordReferralVisit(ref).catch(() => undefined);
    }
    if (!token) {
      if (auth === 'register' || (ref && !auth)) openRegister(registerPrefill(mobile, method));
      if (auth === 'login') openLogin();
      if (auth === 'forgot') openLogin('forgot');
    }
    router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
  }, [router, hydrated, token, openLogin, openRegister]);

  useEffect(() => {
    if (!router.isReady || !hydrated || token) return;
    if (typeof router.query.stag === 'string') captureAffiliateTag(router.query.stag);
  }, [router.isReady, router.query.stag, hydrated, token]);

  // A sign-in completes inside the modal; once there is a session, it has
  // done its job.
  useEffect(() => {
    if (token) setModal(null);
  }, [token]);

  const value = useMemo(
    () => ({ openLogin, openRegister, closeAuthModal }),
    [openLogin, openRegister, closeAuthModal]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {modal?.view === 'login' && (
        <LoginModal
          entry={modal.entry}
          onClose={closeAuthModal}
          onSwitchToRegister={() => openRegister()}
        />
      )}
      {modal?.view === 'register' && (
        <RegisterModal
          prefill={modal.prefill}
          onClose={closeAuthModal}
          onSwitchToLogin={() => openLogin()}
        />
      )}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = (): AuthModalContextType => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
};
