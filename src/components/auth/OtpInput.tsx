import { useRef, type ChangeEvent, type ClipboardEvent, type FC, type KeyboardEvent } from 'react';
import { useTranslation } from '@/context/I18nContext';

/**
 * Six single-character boxes that behave like one field.
 *
 * Typing advances, Backspace on an empty box steps back, arrows move, and a
 * pasted code fills every box at once — people paste these far more often
 * than they type them.
 */

interface Props {
  /** Always `length` characters; a box with no digit yet holds ''. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Fired when the last box is filled, so the form can submit itself. */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  /** Replaces the default box sizing and surface, e.g. the register modal's larger boxes. */
  boxClassName?: string;
  /** Shown in every empty box (the register modal shows a grey "0"). */
  placeholder?: string;
}

const DEFAULT_BOX = 'glass-field h-14 w-11 sm:h-16 sm:w-13';

export const OTP_LENGTH = 6;

const OtpInput: FC<Props> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  boxClassName = DEFAULT_BOX,
  placeholder,
}) => {
  const { t } = useTranslation();
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  const focus = (index: number): void => {
    boxes.current[index]?.focus();
    boxes.current[index]?.select();
  };

  const commit = (next: string[]): void => {
    onChange(next);
    if (next.every((d) => d !== '')) {
      onComplete?.(next.join(''));
    }
  };

  const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    // Take the last digit typed, so overwriting a filled box works without
    // the user having to clear it first.
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const next = [...value];
    next[index] = digit;
    commit(next);

    if (index < OTP_LENGTH - 1) {
      focus(index + 1);
    }
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...value];

      if (next[index]) {
        next[index] = '';
      } else if (index > 0) {
        next[index - 1] = '';
        focus(index - 1);
      }

      onChange(next);
      return;
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focus(index - 1);
    }

    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focus(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!digits) return;

    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? '');
    commit(next);
    focus(Math.min(digits.length, OTP_LENGTH - 1));
  };

  return (
    // A one-time code is a credential for as long as it lives; masked on the
    // container so no box of it reaches a Clarity recording.
    <div
      className="flex justify-center gap-2 sm:gap-3"
      data-clarity-mask="true"
      onPaste={handlePaste}
    >
      {Array.from({ length: OTP_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          value={value[i] ?? ''}
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={t('misc.otp.digit', { n: i + 1 })}
          placeholder={placeholder}
          className={`${boxClassName} text-center text-2xl font-semibold tabular-nums`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
