import { useEffect, useRef, useState, type FC } from 'react';
import { toast } from 'react-toastify';
import apiService from '@/services/api';
import { useSeonGuard } from '@/context/SeonGuardContext';
import { isStepUpCancelled } from '@/lib/seon-guard';
import ModalInput from '@/components/inputs/ModalInput';
import OtpInput, { OTP_LENGTH } from '@/components/auth/OtpInput';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { OTP_RESEND_SECONDS } from '@/constants/auth';
import { fieldErrorMessage } from '@/lib/apiError';
import { requestAddEmailOtp, verifyAddEmail } from '@/services/auth';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  /** Null when the account has no email yet — the field opens empty. */
  currentEmail: string | null;
  onClose: () => void;
  /** `verified` is true when the email was confirmed with a code (add & verify). */
  onSaved: (email: string, verified?: boolean) => void;
  verifyExisting?: boolean;
}

const emptyCode = (): string[] => Array(OTP_LENGTH).fill('');
const resendDeadline = (): string => new Date(Date.now() + OTP_RESEND_SECONDS * 1000).toISOString();
const apiMessage = (err: unknown, fallback: string): string =>
  fieldErrorMessage(err) || (err as { message?: string })?.message || fallback;

// No email on file and Email OTP on: send a code, confirm it, save the email as verified.
const AddVerifyEmail: FC<
  Omit<Props, 'currentEmail' | 'verifyExisting'> & { presetEmail?: string }
> = ({ onClose, onSaved, presetEmail }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(presetEmail ?? null);
  const autoSent = useRef(false);
  const [code, setCode] = useState<string[]>(emptyCode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState<string | null>(null);
  // Under a second left reads as 00:00, so treat it as done.
  const remaining = Math.max(0, (useCountdown(resendAt) ?? 0) - 999);

  const sendCode = async (address: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const res = await requestAddEmailOtp(address);
      if (!res?.success) {
        setError(res?.message || t('acct.email.failed'));
        return false;
      }
      setResendAt(resendDeadline());
      return true;
    } catch (err) {
      setError(apiMessage(err, t('acct.email.failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!presetEmail || autoSent.current) return;
    autoSent.current = true;
    void sendCode(presetEmail);
  }, [presetEmail, sendCode]);

  const submitEmail = async (): Promise<void> => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t('stats.invalidEmail'));
      return;
    }
    if (await sendCode(trimmed)) {
      setSentTo(trimmed);
      setCode(emptyCode());
    }
  };

  const submitCode = async (value = code.join('')): Promise<void> => {
    if (!sentTo || loading) return;
    if (value.length < OTP_LENGTH) {
      setError(t('acct.email.codeIncomplete'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await verifyAddEmail(sentTo, value);
      if (!res?.success) {
        setError(res?.message || t('acct.email.failed'));
        setCode(emptyCode());
        return;
      }
      toast.success(t(presetEmail ? 'acct.email.verifiedOnly' : 'acct.email.verified'));
      onSaved(sentTo, true);
      onClose();
    } catch (err) {
      setError(apiMessage(err, t('acct.email.failed')));
      setCode(emptyCode());
    } finally {
      setLoading(false);
    }
  };

  const resend = async (): Promise<void> => {
    if (!sentTo || remaining > 0 || loading) return;
    setCode(emptyCode());
    if (await sendCode(sentTo)) toast.success(t('acct.email.codeResent'));
  };

  if (!sentTo) {
    return (
      <ProfileModalShell
        title={t('acct.email.addTitle')}
        onClose={onClose}
        onSubmit={submitEmail}
        loading={loading}
        submitLabel={t('acct.email.sendCode')}
      >
        <ModalInput
          label={t('acct.email.label')}
          type="email"
          value={email}
          onChange={setEmail}
          error={error}
          placeholder="you@example.com"
        />
      </ProfileModalShell>
    );
  }

  return (
    <ProfileModalShell
      title={t(presetEmail ? 'acct.email.verifyTitle' : 'acct.email.addTitle')}
      onClose={onClose}
      onSubmit={() => void submitCode()}
      loading={loading}
      submitLabel={t('acct.email.verify')}
    >
      <div className="space-y-4 text-center">
        <p className="text-[14px] leading-relaxed text-white/65">
          {t('acct.email.codeSentTo', { email: sentTo })}
        </p>
        <OtpInput value={code} onChange={setCode} onComplete={(v) => void submitCode(v)} disabled={loading} />
        {error && <p className="text-[13px] text-[#f87171]">{error}</p>}
        <div className="flex flex-col items-center gap-1 text-[13px]">
          <button
            type="button"
            onClick={() => void resend()}
            disabled={remaining > 0 || loading}
            className="text-[#fcd535] disabled:text-white/40"
          >
            {remaining > 0
              ? t('acct.email.resendIn', { time: formatCountdown(remaining) })
              : t('acct.email.resend')}
          </button>
          {!presetEmail && (
            <button
              type="button"
              onClick={() => {
                setSentTo(null);
                setError('');
              }}
              className="text-white/60 hover:text-white/85"
            >
              {t('acct.email.changeAddress')}
            </button>
          )}
        </div>
      </div>
    </ProfileModalShell>
  );
};

const ChangeEmailModal: FC<Props> = (props) => {
  const { email_verification: emailVerificationOn } = usePlatformFeatures();
  if (props.verifyExisting && props.currentEmail) {
    return (
      <AddVerifyEmail
        onClose={props.onClose}
        onSaved={props.onSaved}
        presetEmail={props.currentEmail}
      />
    );
  }
  return !props.currentEmail && emailVerificationOn ? (
    <AddVerifyEmail onClose={props.onClose} onSaved={props.onSaved} />
  ) : (
    <ChangeEmailForm {...props} />
  );
};

// The existing change-email form, unchanged.
const ChangeEmailForm: FC<Props> = ({ currentEmail, onClose, onSaved }) => {
  // Security-sensitive profile changes are risk-scored: redirecting recovery
  // to a new address is how an account takeover is made permanent.
  const { run } = useSeonGuard();
  const { t } = useTranslation();

  const [email, setEmail] = useState(currentEmail ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t('stats.invalidEmail'));
      return;
    }
    if (trimmed === currentEmail?.toLowerCase()) {
      setError(t('acct.email.same'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await run((headers) =>
        apiService.patch('/users/me', { email: trimmed }, { headers })
      );
      if (res?.success) {
        toast.success(t('acct.email.updated'));
        onSaved(trimmed);
        onClose();
      } else {
        setError(res?.message || t('acct.email.failed'));
      }
    } catch (err) {
      // Closing the code prompt is a decision, not a failure.
      if (isStepUpCancelled(err)) return;
      const e = err as { message?: string; errors?: Record<string, string> };
      setError(e?.errors?.email || e?.message || t('acct.email.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileModalShell
      title={t('acct.email.title')}
      onClose={onClose}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ModalInput
        label={t('acct.email.label')}
        type="email"
        value={email}
        onChange={setEmail}
        error={error}
        placeholder="you@example.com"
      />
    </ProfileModalShell>
  );
};

export default ChangeEmailModal;
