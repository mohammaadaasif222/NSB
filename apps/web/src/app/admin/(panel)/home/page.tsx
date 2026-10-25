import type { Metadata } from "next";
import Link from "next/link";
import type { AdminCategory, AdminSettings, Banner } from "@nsb/shared";
import { adminApi } from "@/lib/api";
import { BannerManager } from "../banners/banner-manager";
import { CategoryManager } from "../categories/category-manager";
import { HomeCardsManager } from "./home-cards-manager";
import { editorsOnly } from "@/components/admin/editors-only";

export const metadata: Metadata = { title: "Home page" };

/** The home page's editable blocks in one place, laid out as in the NSB Live Demo admin. */
export default async function HomePageManager() {
  const notice = await editorsOnly("The home page");
  if (notice) return notice;
  const [banners, categories, settings] = await Promise.all([
    adminApi.get<Banner[]>("/admin/banners"),
    adminApi.get<AdminCategory[]>("/admin/categories"),
    adminApi.get<AdminSettings>("/admin/settings"),
  ]);

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Home page</h2>
          <p>Three things you can change. Changes show on the homepage as soon as they are saved.</p>
        </div>
        <Link href="/" target="_blank" rel="noreferrer" className="a-btn g">
          View homepage
        </Link>
      </div>

      <section id="banners" className="a-card mb-4 scroll-mt-24" aria-labelledby="banners-h">
        <h3 id="banners-h">
          <span>
            1. Hero banners <span className="a-tag">big banner on the left</span>
          </span>
        </h3>
        <p className="a-hsub">Add as many banners as you want. They slide one after another. Best image size: 1500 × 610.</p>
        <BannerManager banners={banners} maxUploadBytes={settings.maxUploadBytes} />
      </section>

      <section id="cards" className="a-card mb-4 scroll-mt-24" aria-labelledby="cards-h">
        <h3 id="cards-h">
          <span>
            2. Four cards <span className="a-tag">on the right</span>
          </span>
        </h3>
        <p className="a-hsub">
          Use these four cards to promote anything: a new launch, interior design, a brand store or any premium service. Set a title, pick a colour and
          icon (or use your own image), add tags such as New or Top, and set where it goes. Move them with the arrows. Best image size: 700 × 460.
        </p>
        {/* key: start from the saved cards again after each save. */}
        <HomeCardsManager key={JSON.stringify(settings.homeCards)} cards={settings.homeCards} maxUploadBytes={settings.maxUploadBytes} />
      </section>

      <section id="categories" className="a-card scroll-mt-24" aria-labelledby="categories-h">
        <h3 id="categories-h">3. Browse by category</h3>
        <p className="a-hsub">Use the arrows to change the order. Switch a category off to hide it. Sub-categories hold the listings.</p>
        <CategoryManager categories={categories} maxUploadBytes={settings.maxUploadBytes} />
      </section>
    </>
  );
}
