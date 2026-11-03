import type { Metadata } from "next";
import { HowItWorksContent, StaticPage } from "@/components/site/static-pages";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How Noida Super Bazaar helps people find trusted local businesses, and helps businesses reach customers across Noida.",
};

export default function HowItWorksPage() {
  return (
    <StaticPage
      title={
        <>
          How <em>Noida Super Bazaar</em> works
        </>
      }
      description="Find trusted local businesses in Noida and reach them directly, with no middlemen."
      crumbLabel="How it works"
    >
      <HowItWorksContent />
    </StaticPage>
  );
}
