import { useState, type FC } from 'react';
import { toast } from 'react-toastify';

import api from '@/services/api';
import { resendSignupOtp, verifySignupOtp } from '@/services/auth';
import { useTranslation } from '@/context/I18nContext';
import { useSupportChat } from '@/context/SupportChatContext';
import { apiErrorMessage } from '@/lib/apiError';
import { SUPPORT_EMAIL } from '@/constants/auth';
import type { AccountRestriction } from '@/types/profile';

interface Props {
  restriction: AccountRestriction;
  /** Re-reads /users/me, so a lifted lock disappears. */
  onChanged: () => Promise<unknown> | void;
}

/**
 * Shown on the withdrawal screen while the account is locked (risk team,
 * answer 7). A lock the player can lift themselves, a disposable email,
 * becomes a short verify-a-real-email form instead.
 */
const AccountReviewGate: FC<Props> = ({ restriction, onChanged }) => {
  const { t } = useTranslation();
  const { intercomEnabled, openIntercom } = useSupportChat();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (restriction.requires !== 'CONTACT_VERIFICATION') {
    return (
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100 space-y-3">
        <p>{t('acct.risk.underReview')}</p>
        {intercomEnabled ? (
          <button type="button" onClick={openIntercom} className="text-xs font-semibold underline">
            {t('acct.risk.contactSupport')}
          </button>
        ) : (
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-xs font-semibold underline">
            {SUPPORT_EMAIL}
          </a>
        )}
      </div>
    );
  }

  const sendCode = async () => {
    const next = email.trim();
    if (!next) return;
    setBusy(true);
    try {
      await api.patch('/users/me', { email: next });
      await resendSignupOtp(next);
      setSentTo(next);
      toast.success(t('acct.risk.codeSent'));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('acct.risk.verifyFailed')));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!sentTo || !code.trim()) return;
    setBusy(true);
    try {
      await verifySignupOtp(sentTo, code.trim());
      toast.success(t('acct.risk.verified'));
      await onChanged();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('acct.risk.verifyFailed')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm text-slate-100 space-y-3">
      <p>{restriction.message}</p>
      {!sentTo ? (
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('acct.risk.emailPlaceholder')}
            className="flex-1 rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm"
            aria-label={t('acct.risk.emailPlaceholder')}
          />
          <button
            type="button"
            onClick={() => void sendCode()}
            disabled={busy || !email.trim()}
            className="rounded-lg bg-white text-slate-900 px-3 py-2 text-xs font-semibold disabled:opacity-40"
          >
            {t('acct.risk.sendCode')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-300">{t('acct.risk.enterCode', { email: sentTo })}</p>
          <div className="flex gap-2">
            <input
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="flex-1 rounded-lg bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm tracking-widest"
              aria-label={t('acct.risk.codeLabel')}
            />
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={busy || code.length < 4}
              className="rounded-lg bg-white text-slate-900 px-3 py-2 text-xs font-semibold disabled:opacity-40"
            >
              {t('acct.risk.verify')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="text-xs underline text-slate-300"
          >
            {t('acct.risk.useAnother')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountReviewGate;
