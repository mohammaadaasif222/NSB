import type { Banner, Category } from "@nsb/shared";
import { CategoryGrid } from "@/components/site/home/category-grid";
import { HeroSlider } from "@/components/site/home/hero-slider";
import {
  BestDeals,
  BrandStores,
  Highlights,
  PopularMarkets,
  PromoBanner,
  SideTiles,
  TopPicks,
} from "@/components/site/home/static-sections";
import { api } from "@/lib/api";

export default async function HomePage() {
  const [banners, categories] = await Promise.all([
    api.get<Banner[]>("/banners"),
    api.get<Category[]>("/categories"),
  ]);

  return (
    <>
      <section className="bg-white">
        <div className="container-page grid gap-3 py-3 sm:gap-4 sm:py-6 lg:grid-cols-[750fr_366fr] lg:items-start lg:py-8">
          <HeroSlider banners={banners} />
          <SideTiles />
        </div>
      </section>
      <CategoryGrid categories={categories} />
      <PopularMarkets />
      <Highlights />
      <TopPicks />
      <BrandStores />
      <PromoBanner />
      <BestDeals />
    </>
  );
}
