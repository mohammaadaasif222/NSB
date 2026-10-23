import { Plus_Jakarta_Sans } from "next/font/google";
import { ComingSoon } from "@/components/site/coming-soon";
import { CATEGORY_PAGES_ENABLED } from "@/lib/flags";
import "./real-estate.css";

// The demo's typeface for the real estate pages (the admin panel uses it too).
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

/**
 * /real-estate and its project pages. A static segment, so it wins over /[vertical]: real estate
 * lists builder projects rather than vendors in sub-categories. Same launch gate as every category.
 */
export default function RealEstateLayout({ children }: LayoutProps<"/real-estate">) {
  return CATEGORY_PAGES_ENABLED ? <div className={jakarta.variable}>{children}</div> : <ComingSoon />;
}
