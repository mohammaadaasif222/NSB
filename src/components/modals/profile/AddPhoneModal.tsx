import { useEffect, useRef, useState, type FC } from 'react';
import { toast } from 'react-toastify';
import PhoneField from '@/components/auth/PhoneField';
import OtpInput, { OTP_LENGTH } from '@/components/auth/OtpInput';
import { useTranslation } from '@/context/I18nContext';
import { formatCountdown, useCountdown } from '@/hooks/useCountdown';
import { DIAL_CODES, OTP_RESEND_SECONDS } from '@/constants/auth';
import { fieldErrorMessage } from '@/lib/apiError';
import {
  requestAddMobileOtp,
  resendSignupOtp,
  verifyAddMobile,
  verifySignupOtp,
} from '@/services/auth';
import ProfileModalShell from './ProfileModalShell';

interface Props {
  onClose: () => void;
  onSaved: (mobile: string, countryCode: string) => void;
  verifyExisting?: { mobile: string; countryCode: string };
}

const emptyCode = (): string[] => Array(OTP_LENGTH).fill('');
const resendDeadline = (): string => new Date(Date.now() + OTP_RESEND_SECONDS * 1000).toISOString();
const apiMessage = (err: unknown, fallback: string): string =>
  fieldErrorMessage(err) || (err as { message?: string })?.message || fallback;

const AddPhoneModal: FC<Props> = ({ onClose, onSaved, verifyExisting }) => {
  const { t } = useTranslation();
  const [dialCode, setDialCode] = useState(DIAL_CODES[0].code);
  const [mobile, setMobile] = useState('');
  const [sentTo, setSentTo] = useState<{ mobile: string; dialCode: string } | null>(
    verifyExisting ? { mobile: verifyExisting.mobile, dialCode: verifyExisting.countryCode } : null
  );
  const autoSent = useRef(false);
  const [code, setCode] = useState<string[]>(emptyCode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState<string | null>(null);
  const remaining = Math.max(0, (useCountdown(resendAt) ?? 0) - 999);

  const sendCode = async (number: string, dial: string): Promise<boolean> => {
    setLoading(true);
    setError('');
    try {
      const res = verifyExisting
        ? await resendSignupOtp(number)
        : await requestAddMobileOtp(number, dial);
      if (!res?.success) {
        setError(res?.message || t('acct.phone.failed'));
        return false;
      }
      setResendAt(resendDeadline());
      return true;
    } catch (err) {
      setError(apiMessage(err, t('acct.phone.failed')));
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!verifyExisting || autoSent.current) return;
    autoSent.current = true;
    void sendCode(verifyExisting.mobile, verifyExisting.countryCode);
  }, [verifyExisting]);

  const submitPhone = async (): Promise<void> => {
    if (!/^[0-9]{6,14}$/.test(mobile)) {
      setError(t('acct.phone.invalid'));
      return;
    }
    if (await sendCode(mobile, dialCode)) {
      setSentTo({ mobile, dialCode });
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
      if (verifyExisting) {
        const verified = await verifySignupOtp(sentTo.mobile, value);
        if (!verified?.success) {
          setError(verified?.message || t('acct.phone.failed'));
          setCode(emptyCode());
          return;
        }
        toast.success(t('acct.phone.verifiedOnly'));
        onSaved(sentTo.mobile, sentTo.dialCode);
        onClose();
        return;
      }
      const res = await verifyAddMobile(sentTo.mobile, sentTo.dialCode, value);
      if (!res?.success || !res.data) {
        setError(res?.message || t('acct.phone.failed'));
        setCode(emptyCode());
        return;
      }
      toast.success(t('acct.phone.verified'));
      onSaved(res.data.mobile, res.data.country_code);
      onClose();
    } catch (err) {
      setError(apiMessage(err, t('acct.phone.failed')));
      setCode(emptyCode());
    } finally {
      setLoading(false);
    }
  };

  const resend = async (): Promise<void> => {
    if (!sentTo || remaining > 0 || loading) return;
    setCode(emptyCode());
    if (await sendCode(sentTo.mobile, sentTo.dialCode)) toast.success(t('acct.email.codeResent'));
  };

  if (!sentTo) {
    return (
      <ProfileModalShell
        title={t('acct.phone.addTitle')}
        onClose={onClose}
        onSubmit={submitPhone}
        loading={loading}
        submitLabel={t('acct.email.sendCode')}
      >
        <PhoneField
          id="add-phone-mobile"
          label={t('registerModal.mobile')}
          placeholder={t('registerModal.mobilePlaceholder')}
          dialLabel={t('registerModal.dialCode')}
          dialCode={dialCode}
          onDialCodeChange={setDialCode}
          value={mobile}
          onChange={setMobile}
          invalid={Boolean(error)}
        />
        {error && <p className="text-[13px] text-[#f87171]">{error}</p>}
      </ProfileModalShell>
    );
  }

  return (
    <ProfileModalShell
      title={t(verifyExisting ? 'acct.phone.verifyTitle' : 'acct.phone.addTitle')}
      onClose={onClose}
      onSubmit={() => void submitCode()}
      loading={loading}
      submitLabel={t('acct.email.verify')}
    >
      <div className="space-y-4 text-center">
        <p className="text-[14px] leading-relaxed text-white/65">
          {t('acct.email.codeSentTo', {
            email: `${sentTo.dialCode ? `+${sentTo.dialCode.replace(/\D/g, '')} ` : ''}${sentTo.mobile}`,
          })}
        </p>
        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={(v) => void submitCode(v)}
          disabled={loading}
        />
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
          {!verifyExisting && (
            <button
              type="button"
              onClick={() => {
                setSentTo(null);
                setError('');
              }}
              className="text-white/60 hover:text-white/85"
            >
              {t('acct.phone.changeNumber')}
            </button>
          )}
        </div>
      </div>
    </ProfileModalShell>
  );
};

export default AddPhoneModal;
