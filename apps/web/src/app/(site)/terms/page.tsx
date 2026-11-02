import type { Metadata } from "next";
import { StaticPage, TermsContent } from "@/components/site/static-pages";

export const metadata: Metadata = {
  title: "Terms & Conditions | Noida Super Bazaar",
  description: "Please read these terms before using Noida Super Bazaar.",
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms & Conditions" description="Please read these terms before using Noida Super Bazaar. Last updated: 1 November 2026." crumbLabel="Terms & Conditions">
      <TermsContent />
    </StaticPage>
  );
}
