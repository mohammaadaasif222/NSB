import type { Metadata } from "next";
import { FaqContent, StaticPage } from "@/components/site/static-pages";

export const metadata: Metadata = {
  title: "FAQs | Noida Super Bazaar",
  description: "Quick answers about Noida Super Bazaar for customers and businesses.",
};

export default function FaqPage() {
  return (
    <StaticPage title="Frequently asked questions" description="Quick answers about Noida Super Bazaar for customers and businesses." crumbLabel="FAQs">
      <FaqContent />
    </StaticPage>
  );
}
