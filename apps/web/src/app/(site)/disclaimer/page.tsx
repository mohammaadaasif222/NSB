import type { Metadata } from "next";
import { DisclaimerContent, StaticPage } from "@/components/site/static-pages";

export const metadata: Metadata = {
  title: "Disclaimer | Noida Super Bazaar",
  description: "Important information about the content on Noida Super Bazaar.",
};

export default function DisclaimerPage() {
  return (
    <StaticPage title="Disclaimer" description="Important information about the content on Noida Super Bazaar. Last updated: 1 November 2026." crumbLabel="Disclaimer">
      <DisclaimerContent />
    </StaticPage>
  );
}
