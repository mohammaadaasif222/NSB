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
  <section className="rl-glass-deep rounded-[34px] px-4 pb-[30px] pt-[30px] lg:min-h-[calc(var(--u)*344)] lg:rounded-[calc(var(--u)*34)] lg:p-[calc(var(--u)*30)]">
    <h2 className="text-[24px] font-semibold leading-8 tracking-[-0.02em] text-white lg:text-[length:max(14px,calc(var(--u)*24))] lg:leading-[calc(var(--u)*32)] lg:tracking-normal lg:text-[#f0f1f5]">
      {title}
    </h2>
    <div className="mt-3 space-y-5 lg:mt-[calc(var(--u)*12)] lg:space-y-[calc(var(--u)*12)]">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[14px] leading-5 text-white lg:text-[length:max(11px,calc(var(--u)*16))] lg:leading-[calc(var(--u)*24)] lg:text-[#9da2b4]"
        >
          {p}
        </p>
      ))}
    </div>
  </section>
);

export default PromoTextPanel;
