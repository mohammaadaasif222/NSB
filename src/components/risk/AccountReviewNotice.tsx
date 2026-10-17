import { useEffect, useState, type FC } from 'react';

import Modal from '@/components/ui/Modal';
import { useMe } from '@/context/UserContext';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { SUPPORT_EMAIL } from '@/constants/auth';

const SEEN_KEY = 'account_review_notice_seen';

/**
 * Risk team answer 7: a hard-locked player sees this right after signing in,
 * once per session. It never says why.
 */
const AccountReviewNotice: FC = () => {
  const { me } = useMe();
  const { t } = useTranslation();
  const { intercomEnabled, openIntercom } = useSupportChat();
  const [open, setOpen] = useState(false);

  const hard = me?.account_restriction?.lock === 'HARD_LOCK';

  useEffect(() => {
    if (!hard || !me) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY) === me.id) return;
      sessionStorage.setItem(SEEN_KEY, me.id);
    } catch {
      // Storage refused: show it anyway.
    }
    setOpen(true);
  }, [hard, me]);

  if (!hard) return null;

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      labelledBy="account-review-title"
      className="w-full max-w-sm p-6"
    >
      <div className="space-y-4 text-center">
        <h2 id="account-review-title" className="text-lg font-semibold text-white">
          {t('acct.risk.reviewTitle')}
        </h2>
        <p className="text-sm text-white/80">{t('acct.risk.underReview')}</p>
        <div className="flex flex-col gap-2">
          {intercomEnabled ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openIntercom();
              }}
              className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-semibold"
            >
              {t('acct.risk.contactSupport')}
            </button>
          ) : (
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="rounded-lg bg-white text-slate-900 px-4 py-2 text-sm font-semibold"
            >
              {SUPPORT_EMAIL}
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-white/60 underline"
          >
            {t('acct.risk.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AccountReviewNotice;
