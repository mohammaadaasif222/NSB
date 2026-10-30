/**
 * A two-or-more way switch on the design's glass track — Platform / Personal
 * in the notification centre. The chosen segment rides on a lighter pill.
 * 56px tall, 18px labels, at every width.
 */
interface Item<K extends string> {
  key: K;
  label: string;
}

interface Props<K extends string> {
  items: readonly Item<K>[];
  active: K;
  onChange: (key: K) => void;
  /** Names the tab list for assistive tech. */
  label: string;
  /** Extra classes for the track — a surface of its own (the wallet's glass). */
  className?: string;
}

const SegmentedTabs = <K extends string>({
  items,
  active,
  onChange,
  label,
  className = '',
}: Props<K>) => (
  <div
    role="tablist"
    aria-label={label}
    className={`rl-liquid relative flex h-14 items-center gap-px rounded-full px-1 lg:h-[calc(var(--u)*56)] lg:px-[calc(var(--u)*4)] ${className}`}
  >
    {items.map((item) => {
      const on = item.key === active;
      return (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={on}
          onClick={() => onChange(item.key)}
          className={`flex h-[50px] min-w-0 flex-1 items-center justify-center rounded-full text-[18px] leading-7 transition-colors lg:h-[calc(var(--u)*50)] lg:text-[length:max(min(11px,18px),calc(var(--u)*18))] lg:leading-[calc(var(--u)*28)] ${
            on ? 'bg-white/25 font-medium text-[#f0f1f5]' : 'text-[#9da2b4] hover:text-[#f0f1f5]'
          }`}
        >
          <span className="truncate">{item.label}</span>
        </button>
      );
    })}
  </div>
);

export default SegmentedTabs;
