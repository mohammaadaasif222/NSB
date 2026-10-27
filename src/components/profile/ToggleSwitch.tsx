interface Props {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  narrow?: boolean;
}

export const TOGGLE_SIZE = {
  wide: {
    track: 'h-[calc(var(--u)*30)] w-[calc(var(--u)*70)]',
    knob: 'top-[calc(var(--u)*2)] h-[calc(var(--u)*26)] w-[calc(var(--u)*41)]',
    on: 'left-[calc(var(--u)*27)]',
    off: 'left-[calc(var(--u)*2)]',
  },
  narrow: {
    track: 'h-[30px] w-[50px] lg:h-[calc(var(--u)*30)] lg:w-[calc(var(--u)*70)]',
    knob: 'top-px h-[26px] w-[29.3px] lg:top-[calc(var(--u)*2)] lg:h-[calc(var(--u)*26)] lg:w-[calc(var(--u)*41)]',
    on: 'left-[19.7px] lg:left-[calc(var(--u)*27)]',
    off: 'left-px lg:left-[calc(var(--u)*2)]',
  },
} as const;

/**
 * The account area's switch. Sized to match `SoonToggle` so a live control and
 * an inert one line up in the same column.
 */
const ToggleSwitch = ({ enabled, onToggle, label, disabled = false, narrow = false }: Props) => {
  const size = TOGGLE_SIZE[narrow ? 'narrow' : 'wide'];

  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      aria-busy={disabled || undefined}
      type="button"
      /* 70 x 30 in the design, in `--u` so it tracks the row it sits in. */
      className={`relative ${size.track} shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fcd535] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080b] disabled:cursor-wait disabled:opacity-60 ${
        enabled ? 'bg-[#fcd535]' : 'bg-white/20'
      }`}
    >
      {/* The knob is a wide capsule rather than a dot — at 41 of the track's 70
        it reads as the switch sliding open, not a bead running along it. */}
      <span
        className={`absolute ${size.knob} rounded-full transition-all duration-200 ${
          enabled ? `${size.on} bg-[#111216]` : `${size.off} bg-[#f0f1f5]`
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;
