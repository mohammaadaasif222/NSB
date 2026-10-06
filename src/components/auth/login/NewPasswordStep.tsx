import { useState, type FC, type FormEvent } from 'react';
import { toast } from 'react-toastify';

import { useTranslation } from '@/context/I18nContext';
import PasswordField from '@/components/ui/PasswordField';
import Button from '@/components/ui/Button';
import PasswordRules from '@/components/auth/PasswordRules';
import { PASSWORD_RULES } from '@/constants/auth';

interface NewPasswordStepProps {
  busy: boolean;
  onSubmit: (password: string) => void;
}

type FieldName = 'password' | 'confirm';

/** Choose the new password. It follows the same rules as signup. */
const NewPasswordStep: FC<NewPasswordStepProps> = ({ busy, onSubmit }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState<FieldName | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!PASSWORD_RULES.every((rule) => rule.test(password))) {
      setInvalid('password');
      toast.error(t('registerModal.errPassword'));
      return;
    }
    if (password !== confirm) {
      setInvalid('confirm');
      toast.error(t('reset.mismatch'));
      return;
    }
    setInvalid(null);
    onSubmit(password);
  };

  return (
    <form noValidate onSubmit={submit} className="space-y-3.5">
      <div className="relative">
        <PasswordField
          id="reset-new-password"
          label={t('loginModal.newPassword')}
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (invalid === 'password') setInvalid(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          invalid={invalid === 'password'}
          aria-describedby="reset-password-rules"
          data-autofocus
        />
        <PasswordRules
          id="reset-password-rules"
          password={password}
          visible={focused || invalid === 'password'}
        />
      </div>

      <PasswordField
        id="reset-confirm-password"
        label={t('loginModal.confirmPassword')}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => {
          setConfirm(e.target.value);
          if (invalid === 'confirm') setInvalid(null);
        }}
        invalid={invalid === 'confirm'}
      />

      <Button type="submit" fullWidth loading={busy} className="!mt-8">
        {t('loginModal.submitReset')}
      </Button>
    </form>
  );
};

export default NewPasswordStep;
