import type { FC } from 'react';
import type { LegalDoc } from '@/components/legal/legalCopy';
import { useTranslation } from '@/context/I18nContext';

/**
 * One of the two glass panels the legal page is made of.
 *
 * The design sets this copy in Rubik, not Onest — the only page in the file
 * that does. Everything else reports Onest, so this is almost certainly the
 * designer pasting a document rather than a decision; it is reproduced anyway,
 * because the brief was the design.
 *
 * `rl-glass-edge` rather than `rl-panel`: the panel here is the same "Glass
 * Effect" node the Affiliate and Responsible Gambling pages use — a black 20%
 * fill set to screen, which over this near-black stage comes to nothing. The
 * edge is all there is.
 *
 * 20px over a 1472-wide column at a 24px line is a tight measure for a
 * document this long. It is the design's, kept as drawn, and stepped down with
 * the rest of the furniture below 1536 so a laptop does not read as zoomed in.
 */
interface Props {
  doc: LegalDoc;
}

/* Rubik Regular 20/24 in white — one string, because every line uses it. */
const BODY = 'text-[17px] leading-[21px] 2xl:text-[20px] 2xl:leading-6';

const LegalPanel: FC<Props> = ({ doc }) => {
  const { t } = useTranslation();

  return (
    <section
      id={doc.id}
      /* 34 of inset on the left and 42 on the right in the design, which is the
       designer's hand rather than a rule; 38 both sides lands the text column
       on its drawn 1472 and keeps the panel symmetric. */
      className="rl-glass-edge scroll-mt-28 px-6 py-6 font-rubik text-white sm:px-9.5 sm:pt-7.75 sm:pb-10"
    >
      <p className={BODY}>{t(doc.intro)}</p>

      {doc.sections.map((s) => (
        <div key={s.id} id={s.id} className="scroll-mt-28">
          {/* The design separates every block with one empty 24px line. */}
          <h2 className={`mt-6 font-bold ${BODY}`}>{t(s.title)}</h2>

          {s.body.map((b, i) =>
            b.kind === 'p' ? (
              <p key={i} className={`mt-6 ${BODY}`}>
                {t(b.text)}
              </p>
            ) : (
              /* The design prints these as "* " prefixed lines, flush with the
               paragraph above and with no space between them. A real list,
               marked up as one, reads the same and says what it is to a screen
               reader. `list-inside` is what keeps the marker on the margin
               rather than hanging outside it. */
              <ul key={i} className={`mt-6 list-inside list-disc ${BODY}`}>
                {b.items.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            )
          )}
        </div>
      ))}

      <div className="mt-6">
        {doc.signOff.map((line) => (
          <p key={line} className={`font-bold ${BODY}`}>
            {t(line)}
          </p>
        ))}
      </div>
    </section>
  );
};

export default LegalPanel;
