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
 * Privacy Policy.
 *
 * Written against the data the product actually handles today, so it has to
 * move with the code. In particular, "Third-party services on the site" and
 * "Cookies and browser storage" describe the frontend as it stands: Google
 * Fonts, the Google / Telegram / Steam sign-in flows, the QR-code image service
 * used on the deposit screen, and session / local storage only — no analytics
 * or advertising tags. Adding any tracker, or moving QR generation in-house,
 * means editing those sections in the same change.
 *
 * Not legal advice: operator details are placeholders (constants/legal.ts),
 * and the document needs review by counsel for the licence held before launch.
 */
const SECTIONS: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <P>
        {LEGAL.site} is operated by {LEGAL.entity}, registered at {LEGAL.registeredAddress} (
        <Strong>{LEGAL.brand}</Strong>, <Strong>we</Strong> or <Strong>us</Strong>). We are the
        controller of the personal data described in this policy: we decide why and how it is
        processed. You can reach us about anything in it at{' '}
        <A href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</A>.
      </P>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <P>
          We collect what you give us, what the Service records as you use it, and what our partners
          tell us:
        </P>
        <List
          items={[
            <>
              <Strong>Account details</Strong> — your name, username, email address, mobile number,
              password (stored only as a one-way hash), time zone, avatar and preferences such as
              language and display currency.
            </>,
            <>
              <Strong>Sign-in details</Strong> — if you use Google, Telegram or Steam, the
              identifier and basic profile that provider shares with us, such as your name, email
              address or public profile.
            </>,
            <>
              <Strong>Verification details</Strong> — the identity, address, age and source-of-funds
              information and documents we ask for to meet our legal obligations.
            </>,
            <>
              <Strong>Wallet and transaction details</Strong> — deposit and withdrawal addresses,
              blockchain transaction references, amounts, currencies and networks, and the balances,
              bonuses and rewards on your account.
            </>,
            <>
              <Strong>Gameplay</Strong> — the bets you place, their outcomes, the games you play and
              when, which also drive your bonus wagering, rewards and VIP tier.
            </>,
            <>
              <Strong>Technical details</Strong> — your IP address, device and browser type, and
              sign-in times, used to secure your account and to apply location restrictions.
            </>,
            <>
              <Strong>Communications</Strong> — messages you send to support, and live chat you take
              part in.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use it',
    body: (
      <List
        items={[
          'To create and run your account, process deposits and withdrawals, and settle your bets.',
          'To verify your identity, age and location, and to meet our anti-money-laundering, licensing and tax obligations.',
          'To detect and prevent fraud, cheating, bonus abuse and unauthorised access.',
          'To apply bonuses, rewards and VIP benefits, which are calculated from your play.',
          'To spot signs of gambling harm and act on them, and to honour limits and exclusions you ask for.',
          'To answer your questions and resolve complaints.',
          'To send you promotions, only where you have agreed to receive them.',
          'To keep the Service working and improve it.',
        ]}
      />
    ),
  },
  {
    id: 'legal-bases',
    title: 'Legal bases',
    body: (
      <>
        <P>Where data-protection law requires a legal basis for each use, ours are:</P>
        <List
          items={[
            <>
              <Strong>Contract</Strong> — running your account and providing the games you play.
            </>,
            <>
              <Strong>Legal obligation</Strong> — verification, anti-money-laundering checks,
              responsible-gambling duties and record keeping under our licence.
            </>,
            <>
              <Strong>Legitimate interests</Strong> — keeping the Service secure, preventing fraud
              and abuse, and improving it, where those interests are not outweighed by yours.
            </>,
            <>
              <Strong>Consent</Strong> — marketing messages, which you can withdraw at any time.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    body: (
      <>
        <P>We do not sell your personal data. We share it only where needed, with:</P>
        <List
          items={[
            'identity-verification and fraud-prevention providers;',
            'payment and blockchain service providers that process your deposits and withdrawals;',
            'game studios whose games you play, to the extent needed to run and settle them;',
            'hosting, email and messaging providers that run parts of the Service for us;',
            'our licensing authority, law enforcement, courts and tax authorities, where the law requires it;',
            'a buyer or successor, if our business or part of it is sold or reorganised.',
          ]}
        />
        <P>
          Providers act on our instructions and under contracts that require them to protect your
          data.
        </P>
      </>
    ),
  },
  {
    id: 'third-party-services',
    title: 'Third-party services on the site',
    body: (
      <>
        <P>
          Some parts of the site are served by other companies, which receive your IP address and
          basic browser details when they load:
        </P>
        <List
          items={[
            <>
              <Strong>Google Fonts</Strong> supplies the site&apos;s typeface.
            </>,
            <>
              <Strong>Google</Strong>, <Strong>Telegram</Strong> and <Strong>Steam</Strong> handle
              sign-in when you choose them; their own privacy policies apply to what you share with
              them there.
            </>,
            <>
              <Strong>QR Server</Strong> (api.qrserver.com) draws the QR code on the deposit screen,
              and so receives the deposit address being encoded.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: 'browser-storage',
    title: 'Cookies and browser storage',
    body: (
      <>
        <P>
          We keep a small amount of information in your browser so the site works: your sign-in
          session and its expiry, and your chosen theme, held only for the current browser session;
          and your language choice, kept until you clear it. These are strictly necessary and cannot
          be switched off without breaking sign-in.
        </P>
        <P>
          We do not currently use analytics or advertising cookies. Sign-in providers may set their
          own cookies when you use them. If we add optional cookies in future, we will ask for your
          consent first and update this section.
        </P>
      </>
    ),
  },
  {
    id: 'international-transfers',
    title: 'International transfers',
    body: (
      <P>
        Our providers may process data outside the country where you live. Where the law requires
        it, we protect those transfers with recognised safeguards, such as standard contractual
        clauses or an adequacy decision covering the destination country.
      </P>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    body: (
      <P>
        We keep your data while your account is open and afterwards for as long as the law requires
        — anti-money-laundering and licensing rules usually require verification and transaction
        records to be kept for several years after an account closes. Data we no longer need is
        deleted or anonymised.
      </P>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <P>
        Traffic to the Service is encrypted in transit, passwords are stored as one-way hashes, and
        access to player data is limited to staff and providers who need it. You can add two-factor
        authentication to your account from your security settings. No system is perfectly secure,
        so please use a strong, unique password and tell us straight away if you suspect your
        account has been accessed.
      </P>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <P>Depending on where you live, you may have the right to:</P>
        <List
          items={[
            'access the personal data we hold about you and receive a copy;',
            'have inaccurate data corrected;',
            'have data deleted, where we are not required to keep it;',
            'restrict or object to certain uses, including marketing;',
            'receive data you gave us in a portable format;',
            'withdraw consent you have given, without affecting earlier processing;',
            'complain to your local data-protection authority.',
          ]}
        />
        <P>
          To use any of these, write to{' '}
          <A href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</A>. We may need to confirm
          your identity first, and some requests — deleting verification or transaction records, for
          example — are limited by our legal duty to keep them.
        </P>
      </>
    ),
  },
  {
    id: 'marketing',
    title: 'Marketing',
    body: (
      <P>
        We send promotional emails and messages only if you opt in, which you can do when you
        register or later. Every message tells you how to unsubscribe, and you can also opt out by
        contacting support. We never send marketing to anyone who has self-excluded.
      </P>
    ),
  },
  {
    id: 'minors',
    title: 'Minors',
    body: (
      <P>
        The Service is for adults only. We do not knowingly collect data from anyone under{' '}
        {LEGAL.minimumAge}, and we close any account we find belongs to a minor. If you believe a
        minor has registered, please tell us.
      </P>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <P>
        We update this policy when the way we handle data changes. The date at the top shows the
        latest version, and we will tell you about significant changes by email or on the site. Our{' '}
        <A href="/terms-of-service">Terms of Service</A> explain the rest of our agreement with you.
      </P>
    ),
  },
];

const PrivacyPolicy: FC = () => (
  <LegalDocument
    title="Privacy Policy"
    intro={
      <>
        This policy explains what personal data {LEGAL.brand} collects when you use our casino and
        sportsbook, why we need it, who we share it with, how long we keep it, and the choices and
        rights you have.
      </>
    }
    sections={SECTIONS}
    related={{ href: '/terms-of-service', label: 'Read the Terms of Service' }}
  />
);

export default PrivacyPolicy;
