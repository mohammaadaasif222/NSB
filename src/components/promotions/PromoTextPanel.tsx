import type { FC } from 'react';

/**
 * One of the two long-copy panels — "Details" and "Terms & Conditions".
 *
 * The design gives both a fixed 1548×344 and lets the copy run past it. Kept
 * as a minimum here instead, so a shorter body does not leave a half-empty
 * panel and a longer one is not clipped.
 */
const PromoTextPanel: FC<{ title: string; paragraphs: readonly string[] }> = ({
  title,
  paragraphs,
}) => (
  <section className="rl-glass-deep rounded-[24px] p-5 lg:min-h-[calc(var(--u)*344)] lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*30)]">
    <h2 className="text-[18px] font-semibold leading-7 text-[#f0f1f5] lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)]">
      {title}
    </h2>
    <div className="mt-3 space-y-3 lg:mt-[calc(var(--u)*12)] lg:space-y-[calc(var(--u)*12)]">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[14px] leading-6 text-[#9da2b4] lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)]"
        >
          {p}
        </p>
      ))}
    </div>
  </section>
);

export default PromoTextPanel;
