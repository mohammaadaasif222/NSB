/** A 24×24 line icon drawn from one path, as in the demo. `fill` draws it solid instead. */
export function Icon({ d, size = 20, stroke = 1.7, fill }: { d: string; size?: number; stroke?: number; fill?: string }) {
  return fill ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden>
      <path d={d} />
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
