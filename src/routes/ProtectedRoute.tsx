import { useEffect, type FC, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { LOGIN_HREF } from '@/constants/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards an authenticated page. Renders nothing until the token has been
 * restored from sessionStorage, then sends the visitor to the lobby with the
 * login modal open if there isn't one.
 *
 * Note this is a client-side guard: the token lives in sessionStorage, which
 * Next middleware cannot read. It hides the UI, it does not protect data —
 * the backend must still authorise every request.
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { token, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(LOGIN_HREF);
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
