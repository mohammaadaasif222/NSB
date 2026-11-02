import type { Metadata } from "next";
import { AboutContent, StaticPage } from "@/components/site/static-pages";

export const metadata: Metadata = {
  title: "About Noida Super Bazaar",
  description: "Learn about Noida Super Bazaar, a hyperlocal platform connecting people with trusted local businesses and services.",
};

export default function AboutPage() {
  return (
    <StaticPage
      title={
        <>
          About <em>Noida Super Bazaar</em>
        </>
      }
      description="Noida's first hyperlocal platform, built to connect people with trusted local businesses and services."
      crumbLabel="About us"
    >
      <AboutContent />
    </StaticPage>
  );
}
