import { useMemo, type FC } from 'react';
import { parseLegalContent, type LegalPageData } from '@/components/legal/legalContent';

/**
 * One of the glass panels the legal page is made of — one per page written in
 * the admin console (CRM → Terms and conditions).
 *
 * The design sets this copy in Rubik, not Onest — the only page in the file
 * that does. Everything else reports Onest, so this is almost certainly the
 * designer pasting a document rather than a decision; it is reproduced anyway,
 * because the brief was the design.
 *
 * `rl-glass-edge` rather than `rl-panel`: the panel here is the same "Glass
 * Effect" node the Referral and Responsible Gambling pages use — a black 20%
 * fill set to screen, which over this near-black stage comes to nothing. The
 * edge is all there is.
 *
 * 20px over a 1472-wide column at a 24px line is a tight measure for a
 * document this long. It is the design's, kept as drawn, and stepped down with
 * the rest of the furniture below 1536 so a laptop does not read as zoomed in.
 */
interface Props {
  page: LegalPageData;
}

/* Rubik Regular 20/24 in white — one string, because every line uses it. */
const BODY = 'text-[17px] leading-[21px] 2xl:text-[20px] 2xl:leading-6';

const LegalPanel: FC<Props> = ({ page }) => {
  const blocks = useMemo(() => parseLegalContent(page.content), [page.content]);

  return (
    <section
      id={page.slug}
      /* 34 of inset on the left and 42 on the right in the design, which is the
       designer's hand rather than a rule; 38 both sides lands the text column
       on its drawn 1472 and keeps the panel symmetric. */
      className="rl-glass-edge scroll-mt-28 px-6 py-6 font-rubik text-white sm:px-9.5 sm:pt-7.75 sm:pb-10"
    >
      {/* The design separates every block with one empty 24px line. */}
      {blocks.map((b, i) => {
        const gap = i === 0 ? '' : 'mt-6 ';
        switch (b.kind) {
          case 'h':
            return (
              <h2 key={i} id={b.id} className={`${gap}scroll-mt-28 font-bold ${BODY}`}>
                {b.text}
              </h2>
            );
          case 'b':
            return (
              <p key={i} className={`${gap}font-bold ${BODY}`}>
                {b.text}
              </p>
            );
          case 'ul':
            /* The design prints these as "* " prefixed lines, flush with the
             paragraph above and with no space between them. A real list,
             marked up as one, reads the same and says what it is to a screen
             reader. `list-inside` keeps the marker on the margin. */
            return (
              <ul key={i} className={`${gap}list-inside list-disc ${BODY}`}>
                {b.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i} className={`${gap}${BODY}`}>
                {b.text}
              </p>
            );
        }
      })}
    </section>
  );
};

export default LegalPanel;
