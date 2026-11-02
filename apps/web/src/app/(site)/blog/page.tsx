import type { Metadata } from "next";
import { BlogIndexContent } from "@/components/site/blog-content";

export const metadata: Metadata = {
  title: "Noida Insider | Noida Updates, New Noida, Lifestyle & More",
  description: "Noida updates, New Noida, society updates, lifestyle and more. Local guides and know-how for Noida, Greater Noida and Greater Noida West.",
};

export default function BlogPage() {
  return <BlogIndexContent />;
}
