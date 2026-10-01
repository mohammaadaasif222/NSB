import type { FC } from 'react';
import LegalDocument, {
  A,
  List,
  P,
  Strong,
  type LegalSection,
} from '@/components/legal/LegalDocument';
import { LEGAL } from '@/constants/legal';

/**
 * Terms of Service.
 *
 * A working draft written against how the product behaves today — multi-
 * currency crypto wallets, bonuses with wagering, USD-valued rewards paid as
 * real funds, provably fair Originals, a sportsbook still to come. It is not
 * legal advice: operator details are placeholders (see constants/legal.ts)
 * and the whole document needs review by counsel for the licence held before
 * launch. Section ids are linked from elsewhere (the footer's "Sportsbetting
 * T&S" points at #sports-betting), so rename them with care.
 */
const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreement to these terms',
    body: (
      <>
        <P>
          These Terms of Service (the <Strong>Terms</Strong>) govern your use of {LEGAL.site} and
          every game, feature and service offered on it (together, the <Strong>Service</Strong>).
          The Service is operated by {LEGAL.entity}, registered at {LEGAL.registeredAddress} (
          <Strong>{LEGAL.brand}</Strong>, <Strong>we</Strong> or <Strong>us</Strong>), and licensed
          by {LEGAL.licence}.
        </P>
        <P>
          By creating an account, or by using the Service at all, you agree to these Terms, to our{' '}
          <A href="/privacy-policy">Privacy Policy</A>, and to the rules of each game and promotion
          you take part in. If you do not agree, do not use the Service.
        </P>
      </>
    ),
  },
  {
    id: 'eligibility',
    title: 'Who may play',
    body: (
      <>
        <P>To open an account and play, you must:</P>
        <List
          items={[
            <>
              be at least <Strong>{LEGAL.minimumAge} years old</Strong>, or the legal gambling age
              where you live if that is higher;
            </>,
            'be legally allowed to gamble online in the country or territory you are in when you play;',
            'not be in, or a resident of, a territory we list as restricted, and not use a VPN, proxy or other means to hide where you are;',
            'not be self-excluded from gambling, with us or through a scheme that applies to you;',
            'be acting for yourself, not on behalf of anyone else.',
          ]}
        />
        <P>
          It is your responsibility to check that online gambling is lawful for you. We may ask for
          proof of age and location at any time, and will void play and close accounts that do not
          meet these conditions.
        </P>
      </>
    ),
  },
  {
    id: 'account',
    title: 'Your account',
    body: (
      <>
        <P>
          You may hold <Strong>one account</Strong>. You can register with an email address or
          mobile number confirmed by a one-time code, or through Google, Telegram or Steam. The
          details you give must be true, complete and kept up to date.
        </P>
        <P>
          You are responsible for everything done through your account. Keep your password and
          sign-in methods to yourself, turn on two-factor authentication from your security
          settings, and tell us at once at{' '}
          <A href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</A> if you think someone
          else has had access. Accounts are personal and may not be sold, transferred or shared.
        </P>
      </>
    ),
  },
  {
    id: 'verification',
    title: 'Verification and security checks',
    body: (
      <>
        <P>
          Our licence and anti-money-laundering law require us to know who our players are. We may
          ask you, at registration or later, for proof of identity, address, age and the source of
          your funds, and we may run checks through third-party verification providers.
        </P>
        <P>
          Until we are satisfied, we may restrict deposits, withdrawals, bonuses or play. If you do
          not provide what we ask for within a reasonable time, or provide something false, we may
          suspend or close your account and withhold funds where the law requires us to.
        </P>
      </>
    ),
  },
  {
    id: 'deposits-withdrawals',
    title: 'Deposits and withdrawals',
    body: (
      <>
        <P>
          Your wallet holds a separate balance for each supported currency and network. Deposits are
          credited once they reach the number of network confirmations shown on the deposit screen.
          Sending a currency to an address for a different network, or to an address for another
          currency, can mean the funds are lost; we will try to help but cannot guarantee recovery.
        </P>
        <List
          items={[
            'Deposit only funds that are yours and that come from a lawful source.',
            'Withdrawals are reviewed before they are paid, and may require the verification described above.',
            'Network fees are shown before you confirm a withdrawal and are deducted from the amount sent.',
            'Where we show a value in a display currency (for example USD), it is a conversion at the latest rate we hold and is for information only; your balance is the amount of the currency you hold.',
            'Your account is not a bank account: balances earn no interest and are not covered by any deposit protection scheme.',
          ]}
        />
        <P>
          We may decline or reverse a transaction that we reasonably believe is fraudulent, made in
          error, or in breach of these Terms or of the law.
        </P>
      </>
    ),
  },
  {
    id: 'bonuses',
    title: 'Bonuses and promotions',
    body: (
      <>
        <P>
          Every bonus comes with its own terms, shown with the offer, and those terms apply together
          with this section. Unless an offer says otherwise:
        </P>
        <List
          items={[
            <>
              bonus funds must be <Strong>wagered</Strong> the stated number of times before they
              can be withdrawn, and your progress is shown on your account;
            </>,
            'a bonus not completed by its expiry date expires, along with any winnings from it;',
            'withdrawing while a bonus is active may forfeit the bonus and its winnings;',
            'games contribute to wagering at the rates set out in the offer, and some may not contribute at all;',
            'one welcome offer per person, household, device and payment method.',
          ]}
        />
        <P>
          We may withhold, cancel or reclaim a bonus, and any winnings from it, if we reasonably
          believe it was obtained through abuse — including multiple accounts, collusion, or betting
          patterns designed to extract bonus value without real risk.
        </P>
      </>
    ),
  },
  {
    id: 'rewards',
    title: 'Rewards and VIP',
    body: (
      <>
        <P>
          Rakeback, cashback and periodic (daily, weekly and monthly) rewards accrue from your
          qualifying play over cycles measured in UTC. Rewards are valued in US dollars and, when
          you claim them, are paid as withdrawable funds into your active wallet, converted at the
          latest exchange rate we hold. A reward not claimed within its claim window may expire.
        </P>
        <P>
          VIP tiers are based on your lifetime amount wagered. Reward rates, tier thresholds and
          cycle lengths may change; a change applies to cycles that start after it is made and does
          not reduce a reward you have already earned.
        </P>
      </>
    ),
  },
  {
    id: 'casino-games',
    title: 'Casino games',
    body: (
      <>
        <P>
          Each game has its own rules and return-to-player figure, available from the game. A bet is
          accepted only when it has been confirmed by our systems, and the record held on our
          servers is final over anything shown on your device.
        </P>
        <P>
          Rolluck Originals are <Strong>provably fair</Strong>: each result is derived from a server
          seed, a client seed you can change and a nonce, and you can verify past rounds yourself.
          Games from third-party studios use those studios&apos; certified random number generators.
        </P>
        <P>
          <Strong>Malfunction voids all pays and plays.</Strong> If a game, a connection or our
          systems fail, the round is settled as recorded on our servers or, where it cannot be
          completed, voided and its stake returned. Winnings that result from an obvious error in a
          game, its odds or its payout may be corrected or voided.
        </P>
      </>
    ),
  },
  {
    id: 'sports-betting',
    title: 'Sports betting',
    body: (
      <>
        <P>
          Sports betting is being introduced and some markets shown on the site are previews. When
          it is live, these rules apply in addition to any market-specific rules:
        </P>
        <List
          items={[
            'a bet stands at the odds shown when it is accepted, not the odds when you opened the bet slip;',
            'bets are settled on official results as published by the event’s governing body at the end of the event;',
            'if an event is abandoned, postponed beyond the market’s stated window or not played, bets on it are void and stakes returned unless the market rules say otherwise;',
            'bets placed after the event or market has started, other than on markets offered as live, are void;',
            'bets accepted at an obvious error in odds, line or market (a palpable error) may be resettled at the correct odds or voided.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'responsible-gambling',
    title: 'Responsible gambling',
    body: (
      <>
        <P>
          Gambling should be entertainment, never a way to make money or recover losses. You can ask
          us at any time to limit your deposits, pause your account for a period, or self-exclude,
          by writing to <A href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</A>. As these
          controls arrive in your account settings they will be described on our{' '}
          <A href="/responsible-play">Responsible Play</A> page. A request to lower a limit takes
          effect immediately; a request to raise or remove one takes effect only after a cooling-off
          period.
        </P>
        <P>
          We may also restrict or close an account on our own initiative where we see signs of harm.
          If gambling has stopped being fun, please contact support or a local support organisation.
        </P>
      </>
    ),
  },
  {
    id: 'prohibited',
    title: 'Prohibited conduct',
    body: (
      <>
        <P>You must not:</P>
        <List
          items={[
            'open or use more than one account, or use another person’s account;',
            'collude with other players, or use bots, scripts or any automated means to play;',
            'exploit a bug, error or vulnerability — report it instead, to our bug bounty address;',
            'use the Service to launder money or to handle funds from crime;',
            'dispute or reverse a legitimate deposit (a chargeback) after playing with it;',
            'harass other players or our staff, or post unlawful or abusive content in chat.',
          ]}
        />
        <P>
          Where we find any of these, we may void affected bets, withhold winnings, reclaim bonuses
          and close the account, and we may report the matter to the relevant authorities.
        </P>
      </>
    ),
  },
  {
    id: 'suspension',
    title: 'Suspension and closure',
    body: (
      <>
        <P>
          You can close your account at any time by contacting support. We may suspend or close an
          account for a breach of these Terms, where the law or our licence requires it, or where we
          stop offering the Service where you live.
        </P>
        <P>
          When an account is closed, we return any remaining balance you are entitled to, less any
          amounts owed to us, to a method in your name — unless the closure is for fraud or another
          reason that the law says allows or requires us to hold the funds.
        </P>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    body: (
      <>
        <P>
          The Service is provided as it is and as available. We do not promise it will be
          uninterrupted or error-free, and we are not liable for losses caused by events outside our
          reasonable control, by your equipment or connection, or by your breach of these Terms.
        </P>
        <P>
          To the extent the law allows, our total liability to you in connection with the Service is
          limited to the amount of the stake or transaction the claim concerns. Nothing in these
          Terms limits liability that cannot lawfully be limited, including for fraud or for death
          or personal injury caused by negligence.
        </P>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <P>
        The {LEGAL.brand} name, logo, site design and Originals are ours; third-party games and
        their artwork belong to their studios. You may use the Service for your own personal
        entertainment only, and may not copy, scrape, reverse-engineer or reuse any part of it
        without our written permission.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <P>
        We may update these Terms, for example to reflect new features or changes in the law. We
        will show the date of the latest version at the top of this page and, for material changes,
        tell you by email or on the site before they take effect. If you keep using the Service
        after that, you accept the updated Terms; if you do not, you can close your account.
      </P>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law and disputes',
    body: (
      <P>
        These Terms are governed by the laws of {LEGAL.jurisdiction}. If you have a complaint,
        contact support first and we will do our best to resolve it. If we cannot, you may refer it
        to the dispute resolution body named by our licence, or to the courts of{' '}
        {LEGAL.jurisdiction}, without affecting any rights you have as a consumer where you live.
      </P>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <P>
        Questions about these Terms, or anything else about your account, can be sent to{' '}
        <A href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</A>.
      </P>
    ),
  },
];

const TermsOfService: FC = () => (
  <LegalDocument
    title="Terms of Service"
    intro={
      <>
        These terms set out the agreement between you and {LEGAL.brand} when you use our casino,
        sportsbook and related services — who may play, how your account and wallet work, the rules
        for bonuses and rewards, and what each of us can expect from the other. Please read them
        before you play.
      </>
    }
    sections={SECTIONS}
    related={{ href: '/privacy-policy', label: 'Read the Privacy Policy' }}
  />
);

export default TermsOfService;
