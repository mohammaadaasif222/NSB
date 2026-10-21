import { useState, type FC } from 'react';

export interface PaymentMethodTile {
  /** What `onSelect` is called with. */
  key: string;
  /** Read out, and drawn instead of the logo when there is none. */
  name: string;
  logo?: string;
}

interface Props {
  label: string;
  methods: readonly PaymentMethodTile[];
  selected?: string;
  onSelect: (key: string) => void;
  disabled?: boolean;
}

/** One method: its logo, or its name when the logo is missing or fails. */
const Tile: FC<{
  method: PaymentMethodTile;
  on: boolean;
  disabled: boolean;
  onSelect: (key: string) => void;
}> = ({ method, on, disabled, onSelect }) => {
  const [broken, setBroken] = useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(method.key)}
      disabled={disabled}
      aria-pressed={on}
      title={method.name}
      className={`flex aspect-[168/119] items-center justify-center rounded-2xl p-[13%] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        on ? 'bg-white/[0.14] ring-1 ring-[#ffe779]/50' : 'bg-white/10 hover:bg-white/[0.14]'
      }`}
    >
      {method.logo && !broken ? (
        <img
          src={method.logo}
          alt={method.name}
          className="max-h-full max-w-full object-contain"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="line-clamp-2 text-center text-[14px] font-medium leading-5 text-[#f0f1f5]">
          {method.name}
        </span>
      )}
    </button>
  );
};

/**
 * The local-currency forms' Deposit Method grid, as the design draws it: a
 * 14px label, then three across of 168×119 glass tiles (10 apart, 12 between
 * rows), each with the method's logo centred. Tiles keep that shape at any
 * width.
 */
const PaymentMethodGrid: FC<Props> = ({ label, methods, selected, onSelect, disabled = false }) => (
  <div>
    <p className="mb-3 text-[14px] font-medium leading-5 text-[#f0f1f5]">{label}</p>
    <div className="grid grid-cols-3 gap-x-2.5 gap-y-3">
      {methods.map((m) => (
        <Tile
          key={m.key}
          method={m}
          on={m.key === selected}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  </div>
);

export default PaymentMethodGrid;
