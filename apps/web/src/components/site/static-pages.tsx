import type { ReactNode } from "react";
import Link from "next/link";

export function StaticPage({
  title,
  description,
  children,
  eyebrow,
  crumbLabel,
}: {
  title: ReactNode;
  description: string;
  children: ReactNode;
  eyebrow?: string;
  crumbLabel?: string;
}) {
  return (
    <div className="static-page">
      <header className="static-hero">
        <div className="static-wrap">
          <nav className="static-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>›</span>
            {eyebrow ? (
              <>
                <Link href="/blog">{eyebrow}</Link>
                <span aria-hidden>›</span>
              </>
            ) : null}
            <span aria-current="page">{crumbLabel ?? (typeof title === "string" ? title : "About us")}</span>
          </nav>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </header>
      <div className="static-wrap static-content">{children}</div>
    </div>
  );
}

const WHAT_WE_DO = [
  ["Discover", "Browse local businesses and services by category and area, with clear details and photos."],
  ["Verify", "NSB Verified partners are onboarded by our team, so customers can choose with more confidence."],
  ["Connect", "Customers reach businesses directly by call or WhatsApp, with no middlemen."],
] as const;

const FOR_BUSINESSES = [
  ["1. Share your details", "Tell our team about your business and the category and area you want to appear in."],
  ["2. Go live", "After your details are confirmed, our team sets up your profile and tells you the go-live time."],
  ["3. Get enquiries", "Customers view your profile and contact you directly by call or WhatsApp."],
] as const;

function StaticCards({ id, title, cards }: { id?: string; title: string; cards: readonly (readonly [string, string])[] }) {
  return (
    <section className="static-section" id={id}>
      <h2>{title}</h2>
      <div className="static-cards">
        {cards.map(([heading, text]) => (
          <article key={heading}>
            <h3>{heading}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksContent() {
  return (
    <>
      <StaticCards title="For customers" cards={WHAT_WE_DO} />
      <StaticCards title="For businesses" cards={FOR_BUSINESSES} />
      <section className="static-cta">
        <h2>Want to grow your business with NSB?</h2>
        <p>Share your details and our team will call you.</p>
        <Link href="/partner-with-us">Partner with us</Link>
      </section>
    </>
  );
}

export function AboutContent() {
  return (
    <>
      <section className="static-two">
        <div>
          <h2>Who we are</h2>
          <p>
            Noida Super Bazaar (NSB) is Noida&apos;s first hyperlocal discovery platform. We help people in Noida, Greater Noida and Greater Noida West
            find reliable local businesses, from wedding vendors to real estate projects, all in one place.
          </p>
          <p>
            For local businesses, NSB is a simple way to be discovered by customers who are searching right in their own city and to receive enquiries
            directly.
          </p>
        </div>
        <dl className="static-glance">
          <div>
            <dt>Platform</dt>
            <dd>Hyperlocal discovery</dd>
          </div>
          <div>
            <dt>Areas we serve</dt>
            <dd>Noida, Greater Noida, Greater Noida West</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd>Wedding, Real Estate. More opening soon.</dd>
          </div>
          <div>
            <dt>Parent company</dt>
            <dd>Delhi Info Media Private Limited</dd>
          </div>
        </dl>
      </section>

      <StaticCards id="what-we-do" title="What we do" cards={WHAT_WE_DO} />

      <section className="static-mission">
        <small>Our mission</small>
        <p>To make every local business in Noida easy to find, and every local search easy to trust.</p>
      </section>

      <section className="static-section">
        <h2>Parent company</h2>
        <div className="static-company">
          <div>
            <h3>Delhi Info Media Private Limited</h3>
            <p>Noida Super Bazaar is owned and operated by Delhi Info Media Private Limited, based in Delhi.</p>
          </div>
        </div>
      </section>

      <section className="static-cta">
        <h2>Want to grow your business with NSB?</h2>
        <p>Talk to our team and book your spot today.</p>
        <a href="https://wa.me/919811590088" target="_blank" rel="noopener noreferrer">
          WhatsApp us
        </a>
      </section>
    </>
  );
}

const customerFaqs = [
  ["What is Noida Super Bazaar?", "Noida Super Bazaar is Noida's first hyperlocal discovery platform. It connects people with verified local businesses and services."],
  ["Which areas do you cover?", "We cover Noida, Greater Noida and Greater Noida West."],
  ["Is it free to use?", "Browsing Noida Super Bazaar and contacting businesses is free for customers."],
  [
    "What does NSB Verified mean?",
    <>
      It marks partner businesses that our team has onboarded. See our <Link href="/disclaimer">Disclaimer</Link> for what the badge does and does not
      mean.
    </>,
  ],
  ["How do I contact a business?", "Open the business profile and use the call or WhatsApp option to reach them directly."],
  [
    "I found wrong information. What should I do?",
    <>
      Email <a href="mailto:legal@noidasuperbazaar.com">legal@noidasuperbazaar.com</a> or call / WhatsApp us on +91 98115 90088 and we will review and
      correct it.
    </>,
  ],
] as const;

const businessFaqs = [
  [
    "How do I advertise or list my business?",
    <>
      Visit the <Link href="/">Noida Super Bazaar home page</Link> and contact our team to share your details.
    </>,
  ],
  ["How much does it cost?", "Pricing depends on the category, area and ad type. Our team will share the options once you get in touch."],
  ["How soon will my listing go live?", "After your details are confirmed, our team sets up your profile and tells you the go-live time."],
  ["My category is not listed. Can I still apply?", "Yes. Submit your details and we will contact you as soon as your category opens."],
] as const;

export function FaqContent() {
  return (
    <div className="static-doc static-faq">
      <h2>For customers</h2>
      {customerFaqs.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
      <h2>For businesses</h2>
      {businessFaqs.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function PrivacyContent() {
  return (
    <article className="static-doc">
      <h2>1. Who we are</h2>
      <p>
        Noida Super Bazaar (&quot;NSB&quot;, &quot;we&quot;, &quot;us&quot;) is a hyperlocal discovery platform owned and operated by Delhi Info Media
        Private Limited. This policy explains how we handle information when you use our website and services.
      </p>
      <h2>2. Information we collect</h2>
      <ul>
        <li>
          <b>Details you share with us:</b> such as your name, mobile number, email address, and business details when you fill a form, contact us, or
          enquire about a business.
        </li>
        <li>
          <b>Usage information:</b> such as pages visited, device and browser type, and approximate location, collected through cookies and similar
          tools.
        </li>
        <li>
          <b>Communications:</b> messages you send us by call, WhatsApp or email.
        </li>
      </ul>
      <h2>3. How we use your information</h2>
      <ul>
        <li>To respond to your enquiries and contact you about listings or advertising.</li>
        <li>To connect you with the businesses you show interest in.</li>
        <li>To operate, secure and improve our platform.</li>
        <li>To send service updates. You can ask us to stop promotional messages at any time.</li>
      </ul>
      <h2>4. Sharing of information</h2>
      <p>We do not sell your personal information. We may share it with the business you choose to contact, with service providers who help us run the platform, and with authorities when required by law.</p>
      <h2>5. Data retention and security</h2>
      <p>We keep information only as long as needed for the purposes above or as required by law, and we use reasonable safeguards to protect it. No online system is completely secure, so we cannot guarantee absolute security.</p>
      <h2>6. Your choices</h2>
      <p>
        You may ask us to access, correct or delete your personal information, or to stop contacting you, by emailing{" "}
        <a href="mailto:legal@noidasuperbazaar.com">legal@noidasuperbazaar.com</a> or calling us on +91 98115 90088.
      </p>
      <h2>7. Cookies</h2>
      <p>We use cookies to keep the site working and to understand how it is used. You can control cookies through your browser settings.</p>
      <h2>8. Children</h2>
      <p>Our services are meant for adults. We do not knowingly collect information from children under 18.</p>
      <h2>9. Changes to this policy</h2>
      <p>We may update this policy from time to time. The latest version will always be available on this page.</p>
      <h2>10. Grievance Officer</h2>
      <p>Our Grievance Officer, appointed in line with the Information Technology Act, 2000 and the rules made under it, can be contacted as follows:</p>
      <ul>
        <li>
          <b>Name:</b> Deepak Chauhan
        </li>
        <li>
          <b>Designation:</b> Grievance Officer, Delhi Info Media Private Limited (Noida Super Bazaar)
        </li>
        <li>
          <b>Phone / WhatsApp:</b> +91 98115 90088
        </li>
        <li>
          <b>Email:</b> <a href="mailto:legal@noidasuperbazaar.com">legal@noidasuperbazaar.com</a>
        </li>
        <li>
          <b>Location:</b> Delhi, India
        </li>
      </ul>
      <p>Please include your name and contact details, the page or listing concerned and a clear description of the issue. We will acknowledge your complaint within 24 hours and aim to resolve it within 15 days of receiving it.</p>
      <h2>11. Contact us</h2>
      <p>
        Delhi Info Media Private Limited, Delhi.
        <br />
        Email: <a href="mailto:legal@noidasuperbazaar.com">legal@noidasuperbazaar.com</a>
        <br />
        Phone / WhatsApp: +91 98115 90088
      </p>
    </article>
  );
}

export function TermsContent() {
  return (
    <article className="static-doc">
      <h2>1. Acceptance of terms</h2>
      <p>By using the Noida Super Bazaar website and services (&quot;NSB&quot;), you agree to these terms. If you do not agree, please do not use NSB. NSB is owned and operated by Delhi Info Media Private Limited.</p>
      <h2>2. About our platform</h2>
      <p>NSB is a hyperlocal discovery platform that helps people find local businesses and services. We are not a party to any agreement or transaction between you and a listed business.</p>
      <h2>3. Using NSB</h2>
      <ul>
        <li>Use NSB only for lawful purposes.</li>
        <li>Do not submit false, misleading or harmful information.</li>
        <li>Do not copy, scrape or misuse our content or data without permission.</li>
        <li>Do not try to disrupt or gain unauthorised access to the site.</li>
      </ul>
      <h2>4. Business listings and advertising</h2>
      <ul>
        <li>Businesses must provide accurate and up-to-date information.</li>
        <li>NSB may edit, refuse or remove any listing or advertisement at its discretion.</li>
        <li>Fees, ad slots and durations are agreed with our team before a listing goes live.</li>
        <li>The NSB Verified badge is given at our discretion and may be withdrawn.</li>
      </ul>
      <h2>5. Third-party content and links</h2>
      <p>Listings, photos and details are mostly provided by businesses. NSB may link to other websites that we do not control and are not responsible for.</p>
      <h2>6. Intellectual property</h2>
      <p>The NSB name, logo, design and content belong to Delhi Info Media Private Limited or its licensors. You may not use them without written permission.</p>
      <h2>7. Limitation of liability</h2>
      <p>NSB is provided &quot;as is&quot;. To the extent permitted by law, we are not liable for any loss arising from your use of NSB or from dealings with any listed business.</p>
      <h2>8. Suspension and termination</h2>
      <p>We may suspend or end access to NSB for anyone who breaks these terms.</p>
      <h2>9. Governing law</h2>
      <p>These terms are governed by the laws of India. Courts at Delhi will have jurisdiction over any dispute.</p>
      <h2>10. Changes</h2>
      <p>We may update these terms from time to time. Continued use of NSB means you accept the updated terms.</p>
      <h2>11. Grievance Officer</h2>
      <p>Our Grievance Officer, appointed in line with the Information Technology Act, 2000 and the rules made under it, can be contacted as follows:</p>
      <ul>
        <li>
          <b>Name:</b> Deepak Chauhan
        </li>
        <li>
          <b>Designation:</b> Grievance Officer, Delhi Info Media Private Limited (Noida Super Bazaar)
        </li>
        <li>
          <b>Phone / WhatsApp:</b> +91 98115 90088
        </li>
        <li>
          <b>Email:</b> <a href="mailto:legal@noidasuperbazaar.com">legal@noidasuperbazaar.com</a>
        </li>
        <li>
          <b>Location:</b> Delhi, India
        </li>
      </ul>
      <p>Please include your name and contact details, the page or listing concerned and a clear description of the issue. We will acknowledge your complaint within 24 hours and aim to resolve it within 15 days of receiving it.</p>
      <h2>12. Contact</h2>
      <p>
        For questions about these terms, email <a href="mailto:legal@noidasuperbazaar.com">legal@noidasuperbazaar.com</a> or call / WhatsApp us on +91
        98115 90088.
      </p>
    </article>
  );
}

export function DisclaimerContent() {
  return (
    <article className="static-doc">
      <h2>General information</h2>
      <p>The content on Noida Super Bazaar is for general information and discovery only. We try to keep it accurate and current, but we do not guarantee that everything is complete, correct or up to date.</p>
      <h2>Business listings</h2>
      <p>Details such as services, prices, photos and contact numbers are provided by the listed businesses. Listing on NSB is not a recommendation or guarantee of quality. Please check details and agree on terms directly with the business before paying or committing.</p>
      <h2 id="verification-policy">NSB Verified</h2>
      <p>The NSB Verified badge shows that a business has been onboarded by our team. It is not a warranty of the business&apos;s work, quality or performance.</p>
      <h2>Real estate</h2>
      <p>Project details, prices and possession dates are indicative and may change. Images are for illustration. Please verify RERA registration and all legal documents independently before buying.</p>
      <h2>Wedding and other services</h2>
      <p>We do not take part in bookings or payments between you and a vendor. Any agreement is strictly between you and the vendor.</p>
      <h2>External links</h2>
      <p>Links to other websites are provided for convenience. NSB is not responsible for their content or practices.</p>
      <h2>No professional advice</h2>
      <p>Nothing on NSB is legal, financial or other professional advice.</p>
      <h2>Report an issue</h2>
      <p>
        If you see incorrect or inappropriate content, email <a href="mailto:legal@noidasuperbazaar.com">legal@noidasuperbazaar.com</a> or call /
        WhatsApp us on +91 98115 90088 and we will review it.
      </p>
    </article>
  );
}
