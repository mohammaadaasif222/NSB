import type { Category } from "@nsb/shared";
import { Analytics } from "@/components/site/analytics";
import { CookieBar } from "@/components/site/cookie-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileTabBar } from "@/components/site/mobile-tab-bar";
import { SiteHeader } from "@/components/site/site-header";
import { api } from "@/lib/api";
import { getSiteLocation } from "@/lib/location-server";
import { getSiteSettings, whatsappHref } from "@/lib/site-settings";
import "./static-pages.css";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [categories, { whatsapp, footer }, location] = await Promise.all([
    // Only the footer's links use these, so a failure must not take the page down with it.
    api.get<Category[]>("/categories").catch((): Category[] => []),
    getSiteSettings(),
    getSiteLocation(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader location={location} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} footer={footer} />
      <CookieBar />
      <Analytics />
      <MobileTabBar whatsappHref={whatsapp ? whatsappHref(whatsapp) : null} />
    </div>
  );
}
