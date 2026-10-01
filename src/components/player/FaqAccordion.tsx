import { useState, type FC } from 'react';
import { useTranslation } from '@/context/I18nContext';
import { ChevronRightIcon } from '@/components/icons';

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
 * The lobby FAQ: the question list on the left, the answer beside it.
 *
 * A two-pane reader rather than a stack of disclosures — the answers are long
 * enough that expanding one in place would push the rest of the list off the
 * screen. Below `lg` the panes stack, so the answer sits under the list
 * instead of beside it.
 */
const FaqAccordion: FC = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  return (
    <section className="space-y-4">
      <h2 className="text-center text-[17px] font-semibold text-white sm:text-[19px]">
        {t('dash.faqTitle')}
      </h2>

      <div className="rl-glass grid overflow-hidden rounded-2xl lg:grid-cols-[minmax(0,352px)_minmax(0,1fr)]">
        <ul className="space-y-1 p-2.5">
          {FAQ_ITEMS.map((item, i) => (
            <li key={item.q}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-expanded={active === i}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[12.5px] transition-colors ${
                  active === i
                    ? 'rl-glass-active font-medium text-white'
                    : 'text-white/45 hover:bg-white/5 hover:text-white/75'
                }`}
              >
                <span className="min-w-0">{item.q}</span>
                <ChevronRightIcon
                  size={13}
                  className={`flex-shrink-0 transition-opacity ${
                    active === i ? 'opacity-60' : 'opacity-0'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-white/[0.07] px-5 py-5 lg:border-l lg:border-t-0 lg:px-7 lg:py-6">
          <p className="text-[12.5px] leading-[1.85] text-white/60">{FAQ_ITEMS[active].a}</p>
        </div>
      </div>
    </section>
  );
};

export default FaqAccordion;
