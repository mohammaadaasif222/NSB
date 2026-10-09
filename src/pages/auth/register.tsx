import { useEffect, type FC } from 'react';
import { useRouter } from 'next/router';

import { REGISTER_HREF } from '@/constants/auth';


const RegisterRedirect: FC = () => {
  const router = useRouter();

  useEffect(() => {
    const { email, mobile } = router.query;
    const prefill = new URLSearchParams();

    if (typeof mobile === 'string' && mobile) {
      prefill.set('mobile', mobile);
    } else if (typeof email === 'string' && email) {
      prefill.set('method', 'email');
    }

    const query = prefill.toString();
    void router.replace(query ? `${REGISTER_HREF}&${query}` : REGISTER_HREF);
  }, [router]);

  return null;
};

export default RegisterRedirect;
