import type { FC } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import TextField from '@/components/ui/TextField';
import { DIAL_CODES } from '@/constants/auth';

interface PhoneFieldProps {
  id: string;
  label: string;
  placeholder: string;
  dialLabel: string;
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  /** Digits only; anything else typed is stripped. */
  value: string;
  onChange: (digits: string) => void;
  invalid?: boolean;
}

/**
 * Mobile number with a dial-code picker inside the same pill.
 *
 * The picker is a native <select> laid invisibly over the "+1 ⌄" label: it
 * looks like the design and still opens the platform's own picker, which is
 * far easier to use on a phone than a custom list.
 */
const PhoneField: FC<PhoneFieldProps> = ({
  id,
  label,
  placeholder,
  dialLabel,
  dialCode,
  onDialCodeChange,
  value,
  onChange,
  invalid,
}) => (
  <TextField
    id={id}
    label={label}
    type="tel"
    inputMode="numeric"
    autoComplete="tel-national"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
    invalid={invalid}
    className="ps-2"
    leading={
      <span className="relative flex h-full shrink-0 items-center gap-[9px] pe-[11px] text-[18px] font-bold text-white sm:gap-2 sm:pe-1 sm:text-[15px] sm:font-normal">
        <span aria-hidden="true">{dialCode}</span>
        <ChevronDownIcon size={22} className="text-white/80" />
        <select
          aria-label={dialLabel}
          value={dialCode}
          onChange={(e) => onDialCodeChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {DIAL_CODES.map((d) => (
            <option key={d.iso} value={d.code}>
              {d.iso} {d.code}
            </option>
          ))}
        </select>
      </span>
    }
  />
);

export default PhoneField;
