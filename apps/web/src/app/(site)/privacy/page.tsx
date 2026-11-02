import type { Metadata } from "next";
import { PrivacyContent, StaticPage } from "@/components/site/static-pages";

export const metadata: Metadata = {
  title: "Privacy Policy | Noida Super Bazaar",
  description: "How Noida Super Bazaar collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      description="How Noida Super Bazaar collects, uses and protects your information. Last updated: 1 November 2026."
      crumbLabel="Privacy Policy"
    >
      <PrivacyContent />
    </StaticPage>
  );
}
