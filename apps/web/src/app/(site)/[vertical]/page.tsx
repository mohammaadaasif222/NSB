import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { CategoryIcon } from "@/components/site/home/category-grid";
import { getCategory } from "@/lib/catalog";
import { CATEGORY_PAGES_ENABLED, COMING_SOON_METADATA } from "@/lib/flags";

/**
 * /[vertical], e.g. /wedding. A vertical with sub-categories has no page of its own: visitors go
 * straight to its first sub-category (in admin order), whose page lists the other sub-categories
 * at the top. A vertical without sub-categories yet shows a "Coming soon" landing.
 */

export async function generateMetadata({ params }: PageProps<"/[vertical]">): Promise<Metadata> {
  if (!CATEGORY_PAGES_ENABLED) return COMING_SOON_METADATA;
  const category = await getCategory((await params).vertical);
  return {
    title: `${category.name} in Noida`,
    description:
      category.description ?? `Find trusted ${category.name.toLowerCase()} businesses in Noida, Greater Noida and Noida Extension.`,
  };
}

export default async function CategoryLandingPage({ params }: PageProps<"/[vertical]">) {
  const category = await getCategory((await params).vertical);
  // Sub-categories live under their parent's URL.
  if (category.parent) redirect(`/${category.parent.slug}/${category.slug}`);
  // Temporary redirect: the first sub-category changes when an admin reorders them.
  const [first] = category.children;
  if (first) redirect(`/${category.slug}/${first.slug}`);

  const name = category.name;
  return (
    <>
      <div className="container-page pt-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: name }]} />
      </div>

      <section className="container-page py-6">
        <div className="flex flex-col items-start gap-4 rounded-2xl bg-hero p-6 text-white sm:flex-row sm:items-center sm:gap-6 sm:p-10 lg:p-12">
          <span className="rounded-full bg-white p-1">
            <CategoryIcon category={category} index={0} size={40} />
          </span>
          <div>
            <h1 className="text-3xl leading-tight font-bold sm:text-4xl lg:text-[44px]">{name} in Noida</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 opacity-90 sm:text-lg">
              {category.description ?? "Trusted local businesses in Noida, Greater Noida and Noida Extension."}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-10">
        <div className="container-page">
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-bold text-ink">Coming soon</h2>
            <p className="text-muted">
              We are onboarding {name.toLowerCase()} businesses in Noida. Meanwhile, explore our wedding vendors.
            </p>
            <Link
              href="/wedding"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
            >
              Explore Wedding
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
