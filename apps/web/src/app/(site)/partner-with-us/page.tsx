import type { Metadata } from "next";
import Image from "next/image";
import { Building2, GraduationCap, Heart, type LucideIcon, Phone, ShieldCheck, Sofa, Target } from "lucide-react";
import { PartnerForm } from "./partner-form";
import "./partner.css";

export const metadata: Metadata = {
  title: "Promote Your Business with Noida Super Bazaar",
  description: "Get discovered by customers across Noida, Greater Noida and Greater Noida West, and receive enquiries directly.",
};

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Target, title: "Reach Local Customers", text: "Show your business to people searching across Noida, Greater Noida and Greater Noida West." },
  { icon: Phone, title: "Get Direct Enquiries", text: "Customers view your profile and contact you directly by call or WhatsApp." },
  { icon: ShieldCheck, title: "Build Trust with NSB Verified", text: "Stand out with a verified badge and limited spots in every category and area." },
];

const CATEGORIES: { icon: LucideIcon; label: string }[] = [
  { icon: Heart, label: "Wedding" },
  { icon: Building2, label: "Real Estate" },
  { icon: Sofa, label: "Interior" },
  { icon: GraduationCap, label: "Schools" },
];

const FAQS = [
  ["What is Noida Super Bazaar?", "Noida Super Bazaar is a hyperlocal discovery platform that connects people in Noida with trusted local businesses and services in one place."],
  ["Which areas do you cover?", "We cover Noida, Greater Noida and Greater Noida West."],
  ["How much does it cost to advertise?", "Pricing depends on the category, area and ad type. Share your details and our team will explain the options."],
  ["What does NSB Verified mean?", "It marks partner businesses that we have onboarded and stand behind, so customers can choose with more confidence."],
  ["My category is not listed. Can I still apply?", "Yes. Submit your details and we will contact you as soon as your category opens."],
];

/** The "Promote your business" page from the client's footer pages design. */
export default function PartnerPage() {
  return (
    <div className="static-page">
      <div className="pw-hero">
        <Image src="/images/partner-hero.jpg" alt="" fill priority sizes="100vw" className="pw-bg" />
        <div className="pw-ov" aria-hidden />
        <div className="static-wrap pw-grid">
          <h1>
            <span className="pw-blk">
              <span className="pw-lab">Promote Your</span>
              <b className="pw-x">Business</b>
            </span>
            <span className="pw-blk">
              <span className="pw-lab">With</span>
              <b className="pw-y">Noida Super Bazaar</b>
            </span>
            <span className="pw-l3">Get Discovered. Get More Customer Enquiries.</span>
          </h1>
          <PartnerForm />
        </div>
      </div>

      <div className="static-wrap pw-benefits">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <span className="pw-ic">
              <Icon aria-hidden />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <section className="static-wrap pw-sec">
        <h2>Categories we deal in</h2>
        <p>Advertise in the category where your customers are looking.</p>
        <div className="pw-cats">
          {CATEGORIES.map(({ icon: Icon, label }) => (
            <div key={label}>
              <span className="pw-ic">
                <Icon aria-hidden />
              </span>
              {label}
            </div>
          ))}
          <div className="pw-more">
            <span className="pw-soon">SOON</span>
            <span className="pw-morebtn">More</span>
          </div>
        </div>
      </section>

      <section className="static-wrap pw-sec pw-last">
        <h2>Frequently asked questions</h2>
        <div className="static-doc static-faq">
          {FAQS.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
