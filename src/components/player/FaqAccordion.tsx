import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import chevronRight from '@/assets/lobby/faq-chevron.svg';
import chevronDown from '@/assets/lobby/faq-chevron-down.svg';

/**
 * Sample copy, illustrative pending real support and policy pages — the
 * amounts, timings and audit claims below are placeholders and should be
 * replaced with whatever compliance signs off on before launch.
 */
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'What types of casino games are available on your platform?',
    a: "Our platform offers a wide variety of casino games designed to suit every player's preference and skill level. You can explore an extensive collection of classic and modern slot machines featuring stunning graphics and exciting bonus rounds. Table game enthusiasts can enjoy timeless favorites like blackjack, roulette, baccarat, and poker in multiple variations. We also feature a thrilling live dealer section where you can interact with professional dealers in real time. For those who love instant wins, our selection includes scratch cards, keno, and virtual lottery-style games. Progressive jackpot games are available across slots and table games, offering life-changing prize pools. Video poker fans can choose from dozens of variants including Jacks or Better and Deuces Wild.",
  },
  {
    q: 'How do I claim my welcome bonus after signing up?',
    a: 'Your welcome package is attached to your account the moment registration completes — there is nothing to redeem by hand. Make your first deposit and the matched amount plus the free spins are credited automatically, with the promo code applied if you entered one on the lobby banner. Progress toward the wagering requirement is shown on your dashboard, and the bonus balance converts to withdrawable funds as soon as that requirement is met. Bonus funds are always spent after your real balance, so you are never wagering the bonus while cash is available.',
  },
  {
    q: 'What payment methods are accepted for deposits and withdrawals?',
    a: 'Deposits and withdrawals are available through major cards, popular e-wallets and a range of cryptocurrencies. Every method your account is eligible for is listed in the wallet once you are signed in, along with its minimum, maximum and expected clearing time. Crypto deposits credit after the network confirmations shown on the deposit screen; card and wallet payments are usually instant. Withdrawals return to the method you deposited with wherever the payment provider requires it.',
  },
  {
    q: 'Is my personal and financial information kept secure?',
    a: 'All traffic between your device and our servers is encrypted in transit, and payment details are handled by our payment partners rather than stored on our systems. Account access can be protected with two-factor authentication from your security settings, and every sign-in and withdrawal generates a notification so an unfamiliar session is easy to spot. We only ask for the identity documents our licence obliges us to collect, and those are retained no longer than the licence requires.',
  },
  {
    q: 'How long does it take to process a withdrawal request?',
    a: 'Most withdrawals are reviewed and approved within a few hours of being requested. Once approved, how quickly the money reaches you depends on the method: crypto typically lands within minutes of the transaction being broadcast, e-wallets the same day, and card refunds within a few business days depending on your issuer. A first withdrawal may take longer if identity verification has not yet been completed — clearing that once keeps every later payout on the fast path.',
  },
  {
    q: 'Are your games provably fair and independently audited?',
    a: "Rolluck Originals are provably fair: every round is generated from a server seed, your own client seed and a nonce, and you can change your client seed and verify any past round yourself from the game screen. Third-party titles use the studio's own certified random number generators, which are tested by independent laboratories, and each provider's return-to-player figure is published on the game's detail page.",
  },
];

/**
 * The lobby FAQ, laid out the two ways the design draws it.
 *
 * From lg up it is a two-pane reader: the questions as pills down a clear
 * glass column, the chosen answer large in a darker pane beside it — the
 * answers are long enough that expanding one in place would push the rest
 * of the list off the screen. On a phone there is no room beside the list, so
 * it becomes the design's accordion and the answer opens under its question.
 * The same `active` index drives both, so the two never disagree.
 */
const FaqAccordion: FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  return (
    <section className="space-y-[calc(var(--u)*15)] lg:space-y-[calc(var(--u)*40)]">
      <h2 className="text-center text-[length:max(min(11px,24px),calc(var(--u)*24))] font-semibold leading-[calc(var(--u)*32)] tracking-[-0.02em] text-[#f0f1f5] lg:text-[length:max(min(11px,36px),calc(var(--u)*36))] lg:font-bold lg:leading-[calc(var(--u)*44)] lg:text-[#f4fffb]">
        {t('dash.faqTitle')}
      </h2>

      {/* --- Phone: accordion ------------------------------------------- */}
      <ul className="space-y-[calc(var(--u)*12)] lg:hidden">
        {FAQ_ITEMS.map((item, i) => {
          const open = active === i;
          return (
            <li key={item.q} className="rl-liquid rounded-[calc(var(--u)*34)]">
              <button
                type="button"
                onClick={() => setActive(open ? -1 : i)}
                aria-expanded={open}
                className="flex min-h-[calc(var(--u)*72)] w-full items-center justify-between gap-[calc(var(--u)*8)] py-[calc(var(--u)*10)] pl-[calc(var(--u)*20)] pr-[calc(var(--u)*19)] text-left text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#f0f1f5]"
              >
                <span className="min-w-0">{item.q}</span>
                <img
                  src={chevronDown.src}
                  alt=""
                  className={`h-[calc(var(--u)*28)] w-[calc(var(--u)*28)] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>
              {open && (
                <p className="px-[calc(var(--u)*17)] pb-[calc(var(--u)*23)] text-[length:max(min(11px,12px),calc(var(--u)*12))] leading-[calc(var(--u)*20)] text-[#9da2b4]">
                  {item.a}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* --- Desktop: two panes ----------------------------------------- */}
      <div className="hidden min-h-[calc(var(--u)*521)] lg:grid lg:grid-cols-[44.4fr_55.6fr]">
        <ul className="rl-liquid space-y-[calc(var(--u)*10)] rounded-l-[calc(var(--u)*34)] p-[calc(var(--u)*20)]">
          {FAQ_ITEMS.map((item, i) => (
            <li key={item.q}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={active === i}
                className={`flex min-h-[calc(var(--u)*72)] w-full items-center justify-between gap-[calc(var(--u)*12)] rounded-[calc(var(--u)*34)] py-[calc(var(--u)*12)] pl-[calc(var(--u)*25)] pr-[calc(var(--u)*30)] text-left transition-colors ${
                  active === i
                    ? 'rl-liquid text-[length:max(min(11px,18px),calc(var(--u)*18))] font-semibold leading-[calc(var(--u)*24)] text-[#f0f1f5]'
                    : 'text-[length:max(min(11px,16px),calc(var(--u)*16))] leading-[calc(var(--u)*24)] text-[#9da2b4] hover:bg-white/[0.04] hover:text-[#f0f1f5]'
                }`}
              >
                <span className="min-w-0">{item.q}</span>
                <img
                  src={chevronRight.src}
                  alt=""
                  className="h-[calc(var(--u)*14)] w-[calc(var(--u)*14)] flex-shrink-0"
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="rl-glass-deep rounded-r-[calc(var(--u)*34)] px-[calc(var(--u)*36)] py-[calc(var(--u)*24)]">
          <p className="text-[length:max(min(11px,24px),calc(var(--u)*24))] font-medium leading-[calc(var(--u)*42)] tracking-[-0.02em] text-[#c8ccd8]">
            {FAQ_ITEMS[Math.max(active, 0)].a}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
