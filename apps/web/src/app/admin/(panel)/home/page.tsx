import type { Metadata } from "next";
import Link from "next/link";
import type { AdminCategory, AdminSettings, Banner } from "@nsb/shared";
import { adminApi } from "@/lib/api";
import { BannerManager } from "../banners/banner-manager";
import { CategoryManager } from "../categories/category-manager";

export const metadata: Metadata = { title: "Home page" };

/** The demo's four cards beside the hero. Shown read-only until the cards can be edited. */
const FOUR_CARDS = [
  { title: "Wedding venues", link: "/wedding/wedding-venues" },
  { title: "Makeup & beauty", link: "/wedding/makeup-beauty" },
  { title: "Photography & films", link: "/wedding/photography-films" },
  { title: "Catering", link: "/wedding/catering-halwai" },
];

/** The home page's editable blocks in one place, laid out as in the NSB Live Demo admin. */
export default async function HomePageManager() {
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
          <span className="a-soon">Static for now</span>
        </h3>
        <p className="a-hsub">Upload an image and set where it goes. Best image size: 700 × 460. Editing these cards is coming soon.</p>
        {FOUR_CARDS.map((card, i) => (
          <div key={card.title} className="a-hrow">
            <div className="a-hth">{card.title}</div>
            <div className="a-hmid">
              <b>Card {i + 1}</b>
              <small>Default: {card.title}</small>
              <button type="button" className="a-btn g s" disabled>
                Upload image
              </button>
            </div>
            <div className="a-hlk">
              <label htmlFor={`card-link-${i}`}>Where should it go? (link)</label>
              <input id={`card-link-${i}`} value={card.link} readOnly />
            </div>
          </div>
        ))}
      </section>

      <section id="categories" className="a-card scroll-mt-24" aria-labelledby="categories-h">
        <h3 id="categories-h">3. Browse by category</h3>
        <p className="a-hsub">Use the arrows to change the order. Switch a category off to hide it. Sub-categories hold the listings.</p>
        <CategoryManager categories={categories} maxUploadBytes={settings.maxUploadBytes} />
      </section>
    </>
  );
}
