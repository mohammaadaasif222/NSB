import { useEffect, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Guards a logged-out page (login, register, reset password). Once the token
 * has been restored, an authenticated visitor is sent on to the dashboard at
 * `/` — a logged-in user can never sit on login or signup.
 *
 * Unlike ProtectedRoute this renders its children straight away, before
 * hydration. These pages hold nothing private, and the overwhelmingly common
 * visitor is logged out — so the login form is server-rendered and paints
 * immediately rather than sitting blank until JS loads. An already
 * authenticated visitor sees it briefly before the redirect below fires.
 */
const PublicRoute: FC<PublicRouteProps> = ({ children }) => {
  const { token, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && token) {
      router.replace('/');
    }
  }, [hydrated, token, router]);

  if (hydrated && token) {
    return null;
  }

  return <>{children}</>;
};

export default PublicRoute;
