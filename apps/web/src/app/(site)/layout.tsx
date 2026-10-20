import type { Category } from "@nsb/shared";
import { CookieBar } from "@/components/site/cookie-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { MobileTabBar } from "@/components/site/mobile-tab-bar";
import { SiteHeader } from "@/components/site/site-header";
import { api } from "@/lib/api";
import { getSiteSettings, whatsappHref } from "@/lib/site-settings";

// Public pages read live data from the API on each request (caching is tuned in Milestone 6).
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [categories, { whatsapp }] = await Promise.all([api.get<Category[]>("/categories"), getSiteSettings()]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} />
      <CookieBar />
      <MobileTabBar whatsappHref={whatsapp ? whatsappHref(whatsapp) : null} />
    </div>
  );
}
