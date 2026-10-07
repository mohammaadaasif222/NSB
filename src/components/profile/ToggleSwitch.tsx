interface Props {
  enabled: boolean;
  onToggle: () => void;
}

/**
 * The account area's switch. Sized to match `SoonToggle` so a live control and
 * an inert one line up in the same column.
 */
const ToggleSwitch = ({ enabled, onToggle }: Props) => (
  <button
    onClick={onToggle}
    role="switch"
    aria-checked={enabled}
    type="button"
    /* 70 x 30 in the design, in `--u` so it tracks the row it sits in. */
    className={`relative h-[calc(var(--u)*30)] w-[calc(var(--u)*70)] shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fcd535] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080b] ${
      enabled ? 'bg-[#fcd535]' : 'bg-white/20'
    }`}
  >
    {/* The knob is a wide capsule rather than a dot — at 41 of the track's 70
        it reads as the switch sliding open, not a bead running along it. */}
    <span
      className={`absolute top-[calc(var(--u)*2)] h-[calc(var(--u)*26)] w-[calc(var(--u)*41)] rounded-full transition-all duration-200 ${
        enabled ? 'left-[calc(var(--u)*27)] bg-[#111216]' : 'left-[calc(var(--u)*2)] bg-[#f0f1f5]'
      }`}
    />
  </button>
);

export default ToggleSwitch;
