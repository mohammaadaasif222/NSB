/**
 * The Terms and Privacy copy, exactly as the design writes it.
 *
 * THIS REPLACED A LONGER PAIR OF DOCUMENTS and the difference matters.
 *
 * What was here before was written against how the product actually behaves —
 * per-currency crypto wallets, provably fair Originals, bonus wagering, VIP
 * tiers measured in UTC cycles, the self-exclusion cooling-off rule, the three
 * sign-in providers, the QR service that sees deposit addresses. None of that
 * survives in the copy below, which is short and generic. That is the client's
 * text and it is what the design prints, so it is what ships; but it is a
 * smaller promise than the product makes, and counsel should read the two
 * together before launch rather than treating this as a finished document.
 *
 * Two concrete gaps worth naming, because code points at them:
 *   - There is no sports-betting section. The footer used to deep-link
 *     `#sports-betting`; that anchor no longer exists.
 *   - "Last Updated: August 2026" is the design's own date, carried verbatim.
 *
 * Section ids are ours, not the design's — the design numbers its headings and
 * nothing more. They exist so the footer and other pages can deep-link.
 */

export type LegalBody = { kind: 'p'; text: string } | { kind: 'ul'; items: readonly string[] };

export interface LegalSection {
  id: string;
  /** Printed with its number, exactly as the design writes it. */
  title: string;
  body: readonly LegalBody[];
}

export interface LegalDoc {
  id: string;
  intro: string;
  sections: readonly LegalSection[];
  /** The bold lines the design closes each document with. */
  signOff: readonly string[];
}

const p = (text: string): LegalBody => ({ kind: 'p', text });
const ul = (items: readonly string[]): LegalBody => ({ kind: 'ul', items });

/** The design prints this once, under the page title. */
export const LEGAL_UPDATED = 'Last Updated: August 2026';

export const TERMS: LegalDoc = {
  id: 'terms-and-conditions',
  intro:
    'Welcome to Rolluck. By creating an account or using our website, games, promotions, and services, you agree to these Terms & Conditions.',
  sections: [
    {
      id: 'about',
      title: '1. About Rolluck',
      body: [
        p(
          'Rolluck provides online gaming and entertainment services through its website and related platforms. These Terms explain the rules that apply when you use our services.'
        ),
      ],
    },
    {
      id: 'eligibility',
      title: '2. Eligibility',
      body: [
        p(
          'You must meet the minimum legal age and all other eligibility requirements applicable in your location to use Rolluck.'
        ),
        p(
          'You are responsible for ensuring that online gaming is legally permitted in your jurisdiction.'
        ),
        p('Rolluck reserves the right to verify your age, identity, and eligibility at any time.'),
      ],
    },
    {
      id: 'your-account',
      title: '3. Your Account',
      body: [
        p(
          'You are responsible for providing accurate and up-to-date information when creating your account.'
        ),
        p(
          'You must keep your login details confidential and must not allow another person to use your account.'
        ),
        p('One person may only maintain accounts as permitted by Rolluck.'),
        p(
          'If we identify suspicious, fraudulent, or unauthorized activity, we may restrict, suspend, or close an account.'
        ),
      ],
    },
    {
      id: 'deposits-withdrawals',
      title: '4. Deposits & Withdrawals',
      body: [
        p('All deposits must come from a payment method that you are authorized to use.'),
        p('You are responsible for checking your balance and transaction information.'),
        p(
          'Withdrawals may require identity verification and additional checks before being processed.'
        ),
        p(
          'Processing times may vary depending on the payment method and verification requirements.'
        ),
      ],
    },
    {
      id: 'games-results',
      title: '5. Games & Results',
      body: [
        p('All games are subject to their individual rules and conditions.'),
        p(
          'Game results are determined by the applicable game systems and technologies used by Rolluck.'
        ),
        p(
          'In the event of a technical issue, system error, or malfunction, Rolluck may take appropriate action, including voiding affected transactions or games where permitted by applicable law.'
        ),
      ],
    },
    {
      id: 'bonuses-promotions',
      title: '6. Bonuses & Promotions',
      body: [
        p('Promotions, bonuses, rewards, and campaigns may have their own specific terms.'),
        p(
          'You must read and understand the applicable promotional conditions before participating.'
        ),
        p(
          'Rolluck reserves the right to cancel, modify, or withdraw a promotion where permitted by applicable law.'
        ),
      ],
    },
    {
      id: 'responsible-gaming',
      title: '7. Responsible Gaming',
      body: [
        p('We want gaming to remain entertainment.'),
        p('Set limits, understand your spending, and only play with money you can afford to lose.'),
        p(
          'If gaming stops feeling like entertainment, take a break and use the responsible gaming tools available through Rolluck.'
        ),
      ],
    },
    {
      id: 'prohibited-activities',
      title: '8. Prohibited Activities',
      body: [
        p(
          'You must not use Rolluck for fraud, money laundering, unauthorized transactions, cheating, manipulation, or any other unlawful activity.'
        ),
        p(
          'You must not attempt to interfere with our website, games, systems, or security measures.'
        ),
      ],
    },
    {
      id: 'suspension-closure',
      title: '9. Account Suspension & Closure',
      body: [
        p(
          'Rolluck may suspend or close an account where there is a breach of these Terms, suspected fraud, security concerns, legal requirements, or other legitimate reasons.'
        ),
        p(
          'Where required by law, applicable balances will be handled according to the relevant procedures.'
        ),
      ],
    },
    {
      id: 'intellectual-property',
      title: '10. Intellectual Property',
      body: [
        p(
          'All Rolluck branding, designs, graphics, content, software, and other materials belong to Rolluck or its respective licensors.'
        ),
        p(
          'You may not copy, reproduce, modify, distribute, or commercially use our content without permission.'
        ),
      ],
    },
    {
      id: 'availability',
      title: '11. Availability',
      body: [
        p(
          'We aim to keep Rolluck available and reliable, but we cannot guarantee uninterrupted access.'
        ),
        p(
          'Maintenance, technical issues, third-party services, or circumstances beyond our reasonable control may affect availability.'
        ),
      ],
    },
    {
      id: 'changes',
      title: '12. Changes to These Terms',
      body: [
        p('We may update these Terms from time to time.'),
        p(
          'When changes are made, we will update the date shown at the top of this page. Your continued use of Rolluck after the changes take effect means you accept the updated Terms, where permitted by law.'
        ),
      ],
    },
    {
      id: 'contact',
      title: '13. Contact Us',
      body: [
        p(
          'If you have questions about these Terms, your account, or our services, please contact Rolluck Support through the available support channels.'
        ),
      ],
    },
  ],
  signOff: ['Rolluck — Play with confidence. Play responsibly.'],
};

export const PRIVACY: LegalDoc = {
  id: 'privacy-policy',
  intro:
    'At Rolluck, we understand that your personal information matters. This Privacy Policy explains what information we collect, why we collect it, how we use it, and how we work to protect it.',
  sections: [
    {
      id: 'information-we-collect',
      title: '1. Information We Collect',
      body: [
        p('Depending on how you use Rolluck, we may collect information such as:'),
        ul([
          'Name and contact information',
          'Date of birth and age verification information',
          'Account and login information',
          'Identity verification information',
          'Payment and transaction information',
          'Gaming and account activity',
          'Device and technical information',
          'IP address and approximate location information',
          'Communications with our customer support team',
          'Information required to meet legal and regulatory obligations',
        ]),
      ],
    },
    {
      id: 'how-we-use',
      title: '2. How We Use Your Information',
      body: [
        p('We may use your information to:'),
        ul([
          'Create and manage your Rolluck account',
          'Provide our gaming and related services',
          'Process deposits and withdrawals',
          'Verify your identity and eligibility',
          'Prevent fraud, abuse, and unauthorized activity',
          'Protect the security of our platform',
          'Provide customer support',
          'Improve our games, services, and user experience',
          'Meet legal and regulatory requirements',
          'Send service-related communications',
          'Send promotional communications where permitted and where you have the appropriate choice or consent',
        ]),
      ],
    },
    {
      id: 'cookies',
      title: '3. Cookies & Similar Technologies',
      body: [
        p(
          'Rolluck may use cookies and similar technologies to remember preferences, understand how our website is used, improve performance, and support security.'
        ),
        p(
          'You may be able to manage certain cookie preferences through your browser or our available privacy controls.'
        ),
      ],
    },
    {
      id: 'how-we-share',
      title: '4. How We Share Information',
      body: [
        p('We do not sell your personal information simply for the purpose of selling it.'),
        p(
          'We may share information with trusted service providers, payment providers, identity verification providers, technology partners, professional advisers, regulators, law enforcement, or other parties where necessary and permitted by applicable law.'
        ),
      ],
    },
    {
      id: 'protecting-your-information',
      title: '5. Protecting Your Information',
      body: [
        p(
          'We use reasonable technical, organizational, and security measures designed to protect your information against unauthorized access, loss, misuse, alteration, or disclosure.'
        ),
        p('However, no online system can be guaranteed to be completely secure.'),
      ],
    },
    {
      id: 'data-retention',
      title: '6. Data Retention',
      body: [
        p(
          'We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including to provide services, meet legal obligations, resolve disputes, prevent fraud, and enforce our agreements.'
        ),
        p(
          'Retention periods may vary depending on the type of information and applicable legal requirements.'
        ),
      ],
    },
    {
      id: 'your-privacy-rights',
      title: '7. Your Privacy Rights',
      body: [
        p(
          'Depending on where you live, you may have rights relating to your personal information, including the right to:'
        ),
        ul([
          'Request access to your information',
          'Request correction of inaccurate information',
          'Request deletion where legally available',
          'Object to or restrict certain processing',
          'Withdraw consent where processing is based on consent',
          'Request a copy of certain information',
        ]),
        p('Some rights may be subject to legal or regulatory limitations.'),
      ],
    },
    {
      id: 'childrens-privacy',
      title: "8. Children's Privacy",
      body: [
        p(
          'Rolluck is intended only for individuals who meet the applicable minimum legal age for our services.'
        ),
        p(
          'We do not knowingly allow individuals who are not legally eligible to use our services to create or maintain accounts.'
        ),
      ],
    },
    {
      id: 'international-transfers',
      title: '9. International Data Transfers',
      body: [
        p(
          'Your information may be processed or stored in countries outside your place of residence.'
        ),
        p(
          'Where required, Rolluck will take appropriate steps to ensure that applicable legal requirements for international data transfers are followed.'
        ),
      ],
    },
    {
      id: 'third-party-services',
      title: '10. Third-Party Services',
      body: [
        p(
          'Rolluck may work with third-party services that help us provide payments, identity verification, security, analytics, communications, and other functionality.'
        ),
        p(
          'These providers may process information according to their own privacy policies and applicable agreements.'
        ),
      ],
    },
    {
      id: 'policy-changes',
      title: '11. Changes to This Privacy Policy',
      body: [
        p(
          'We may update this Privacy Policy from time to time to reflect changes to our services, technology, or legal requirements.'
        ),
        p('The latest version will always display the updated date at the top of this page.'),
      ],
    },
    {
      id: 'privacy-contact',
      title: '12. Contact Us',
      body: [
        p(
          'If you have questions about this Privacy Policy or want to exercise an applicable privacy right, please contact Rolluck through our official support channels.'
        ),
      ],
    },
  ],
  signOff: ['Your privacy matters.', 'Your trust matters.', 'At Rolluck, we take both seriously.'],
};
