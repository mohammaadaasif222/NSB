import { useId, type FC } from 'react';

/**
 * A labelled field inside an account dialog.
 *
 * Same control the design draws in `SetLimitModal`: 56 tall, 34 of radius,
 * white 5% on a 10% edge, the value in 18/24 bold and 24 in from the edge, with
 * a 14/20 medium label above it. It used to be a slate-800 box with a 12px
 * label, which is what made the dialogs read as a different application.
 *
 * The label is tied to the input by a generated id — it was floating free
 * before, so clicking it did nothing and a screen reader announced the field
 * unnamed.
 */
interface ModalInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}

const ModalInput: FC<ModalInputProps> = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.75">
      <label htmlFor={id} className="block text-sm leading-5 font-medium text-[#f0f1f5]">
        {label}
      </label>

      {/* Passwords, addresses and usernames pass through here — kept out of
          Clarity's recordings whatever the project's masking level is set to. */}
      <input
        id={id}
        data-clarity-mask="true"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`rl-modal-field h-14 w-full px-6 text-[18px] leading-6 font-bold text-[#f0f1f5] outline-none placeholder:font-normal placeholder:text-[#9ca3af] focus-visible:border-white/30 ${
          error ? 'border-[#ef4462]' : ''
        }`}
      />

      {error && (
        <p id={errorId} role="alert" className="text-sm leading-5 text-[#ef4462]">
          {error}
        </p>
      )}
    </div>
  );
};

export default ModalInput;
