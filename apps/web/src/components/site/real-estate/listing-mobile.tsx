import Link from "next/link";
import type { ReactNode } from "react";
import { type Category, POSSESSION_STATUSES, PROJECT_TYPE_LABELS, type ProjectSummary } from "@nsb/shared";
import { cormorant, manrope } from "@/lib/fonts";
import { projectPath } from "@/lib/catalog";
import { listedAgo, priceText, sqmOf } from "./format";
import { LeadButton } from "./lead-dialog";
import { CardActions, CardGallery } from "./listing-mobile-client";
import { FilterSelect, SortSelect } from "./listing-widgets";
import "./listing-mobile.css";

/**
 * The real estate listing page on phones, after real-estate-listing-mobile-page.html: search, one
 * row of filter chips, the count, then a card per project with a wedding slider between them.
 * Every value comes from the page's data; wider screens keep the desktop page.
 */

const SHIELD = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const STAR = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="m12 2 3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8 5.6 21.5l1.7-7.2L2 9.6 9 9z" />
  </svg>
);
const TICK = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m5 12 5 5 9-10" />
  </svg>
);
const WHATSAPP = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.6c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.4 0 .2 0 .8-.2 1.3Z" />
  </svg>
);
const SEARCH = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1700D6" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** The slider tile icons from the design, by wedding sub-category. */
const TILE_PATHS: Record<string, string> = {
  hall: "M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6",
  ring: "M12 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM9 4l3 3 3-3-1.5-2h-3zM12 7v3",
  cam: "M3 8h4l2-3h6l2 3h4v12H3zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z",
  bag: "M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0",
  kitchen: "M4 4h16v16H4zM4 10h16M9 14h.01M15 14h.01",
  ad: "M3 11v3h3l6 4V7L6 11zM16 9a4 4 0 0 1 0 6",
};
const TILE_OF: Record<string, string> = {
  "wedding-venues": "hall",
  "makeup-beauty": "ring",
  "photography-films": "cam",
  "catering-halwai": "kitchen",
  "cards-invitations": "bag",
};
const TileIcon = ({ name }: { name: string }) => (
  <span className="rl-wi">
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={TILE_PATHS[name] ?? TILE_PATHS.bag} />
    </svg>
  </span>
);
const TileArrow = () => (
  <span className="rl-wgo" aria-hidden>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  </span>
);

/** "Wedding season is here": the wedding sub-categories with their live listing counts. */
function WeddingSlider({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  if (categories.length === 0) return null;
  return (
    <section className="rl-wd" aria-label="Wedding season is here">
      <div className="rl-wdh">
        <div>
          <span className="rl-wtag">Also on Noida Super Bazaar</span>
          <h2>Wedding season is here</h2>
        </div>
        <Link className="rl-wall" href="/wedding">
          View all
        </Link>
      </div>
      <div className="rl-wsl">
        {categories.map((c) => (
          <Link key={c.id} className="rl-wt" href={`/wedding/${c.slug}`}>
            <TileIcon name={TILE_OF[c.slug] ?? "bag"} />
            <span>
              <b>{c.name}</b>
              <small>
                <span>{counts[c.slug] ? `${counts[c.slug]} listed` : "Explore"}</span>
                <TileArrow />
              </small>
            </span>
          </Link>
        ))}
        <Link className="rl-wt is-ad" href="/partner-with-us">
          <TileIcon name="ad" />
          <span>
            <b>List your business</b>
            <small>
              <span>Free to start</span>
              <TileArrow />
            </small>
          </span>
        </Link>
      </div>
    </section>
  );
}

function ProjectCard({
  project: p,
  eager,
  whatsappHref,
}: {
  project: ProjectSummary;
  eager: boolean;
  whatsappHref: (name: string) => string | null;
}) {
  const href = projectPath(p.slug);
  const photos = p.photoPreview.length ? p.photoPreview : p.coverImageUrl ? [p.coverImageUrl] : [];
  const areas = p.keyConfigurations.map((c) => c.superArea).filter((a): a is number => !!a);
  const minArea = areas.length ? Math.min(...areas) : null;
  const ready = p.possessionStatus === "Ready to Move" || p.possessionStatus === "Completed";
  const chat = whatsappHref(p.name);
  // Tags: configurations, the possession date, and the builder when a broker lists the project.
  const tags = [
    ...p.keyConfigurations.map((c) => c.title),
    ...(p.possessionDate ? [`Possession: ${p.possessionDate}`] : []),
    ...(p.advertiserType === "broker" && p.builder ? [`By ${p.builder}`] : []),
  ];

  return (
    <article className="rl-card">
      <div className="rl-photo">
        <CardGallery name={p.name} href={href} photos={photos} eager={eager} />
        {(p.isFeatured || p.isPremium) && (
          <div className="rl-badges">
            {p.isFeatured && <span className="rl-badge is-gold">Featured</span>}
            {p.isPremium && <span className="rl-badge">{STAR}Premium</span>}
          </div>
        )}
        {/* Sold by the builder itself: no broker in between. */}
        {p.advertiserType === "builder" && <span className="rl-badge rl-zb">{TICK}Zero Brokerage</span>}
        <CardActions name={p.name} href={href} />
      </div>

      <div className="rl-body">
        <div className="rl-row1">
          <div>
            <h3 className="rl-proj">
              <Link href={href}>{p.name}</Link>
            </h3>
            <div className="rl-type">
              <b>{PROJECT_TYPE_LABELS[p.type]}</b> in {p.locality}, {p.area}
            </div>
          </div>
          {p.reraId && (
            <span className="rl-rera" tabIndex={0}>
              {SHIELD}RERA
              <span className="rl-tip" role="tooltip">
                RERA No.<b>{p.reraId}</b>
              </span>
            </span>
          )}
        </div>

        <div className={`rl-money${minArea ? "" : " is-one"}`}>
          <div>
            <div className="rl-price">
              {p.minPrice ? priceText(p.minPrice) : "On request"}
              {p.minPrice && <small>onwards</small>}
            </div>
            <div className={`rl-sub${ready ? " is-ok" : ""}`}>{p.possessionStatus}</div>
          </div>
          {minArea && (
            <div>
              <div className="rl-area">
                {minArea.toLocaleString("en-IN")} sqft <small>({sqmOf(minArea).toLocaleString("en-IN")} sqm)</small>
              </div>
              <div className="rl-sub">{areas.length > 1 ? "Super area onwards" : "Super area"}</div>
            </div>
          )}
        </div>

        {tags.length > 0 && (
          <div className="rl-tags">
            {tags.map((t, i) => (
              <span key={`${t}-${i}`} className="rl-tag">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="rl-dealer">
          <div className="rl-who">
            <b>{p.advertiserName}</b>
            <span>
              {p.advertiserType === "builder" ? "Builder" : "Broker"} • {listedAgo(p.createdAt)}
            </span>
          </div>
          <LeadButton
            className="rl-num"
            projectId={p.id}
            advertiser={p.advertiserName}
            advertiserType={p.advertiserType}
            source="View Number"
          >
            View number
          </LeadButton>
          {chat ? (
            <a className="rl-round is-wa" href={chat} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp about ${p.name}`}>
              {WHATSAPP}
            </a>
          ) : (
            <LeadButton
              className="rl-round is-wa"
              projectId={p.id}
              advertiser={p.advertiserName}
              advertiserType={p.advertiserType}
              source="Enquiry"
            >
              <span className="sr-only">Enquire about {p.name}</span>
              {WHATSAPP}
            </LeadButton>
          )}
        </div>
      </div>
    </article>
  );
}

const BHK = [
  { value: "", label: "BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK+" },
];

export function RealEstateListingMobile({
  projects,
  total,
  place,
  q,
  bhk,
  possession,
  sort,
  possessionHref,
  clearSearchHref,
  ad,
  weddingCategories,
  weddingCounts,
  whatsappHref,
  pagination,
  eagerCards,
}: {
  projects: ProjectSummary[];
  total: number;
  place: string;
  q: string;
  bhk: string;
  possession: string;
  sort: string;
  /** This page with the possession filter set ("" clears it). */
  possessionHref: (value: string) => string;
  clearSearchHref: string;
  /** The admin's ad banner, shown after the second card. */
  ad: ReactNode;
  weddingCategories: Category[];
  weddingCounts: Record<string, number>;
  whatsappHref: (name: string) => string | null;
  pagination: ReactNode;
  eagerCards: number;
}) {
  const chip = (status: (typeof POSSESSION_STATUSES)[number], label: string) => (
    <Link className="rl-chip" href={possessionHref(possession === status ? "" : status)} aria-pressed={possession === status} role="button">
      {label}
    </Link>
  );

  const items = projects.flatMap((project, i) => {
    const card = <ProjectCard key={project.id} project={project} eager={i < eagerCards} whatsappHref={whatsappHref} />;
    if (i === 1) return [card, <div key="ad">{ad}</div>];
    if (i === 3) return [card, <WeddingSlider key="wedding" categories={weddingCategories} counts={weddingCounts} />];
    return [card];
  });

  return (
    <div className={`rl ${cormorant.variable} ${manrope.variable}`}>
      <form action="/real-estate" className="rl-search" role="search">
        {bhk && <input type="hidden" name="bhk" value={bhk} />}
        {possession && <input type="hidden" name="possession" value={possession} />}
        {sort !== "rel" && <input type="hidden" name="sort" value={sort} />}
        {SEARCH}
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search city, locality or project"
          aria-label="Search projects"
          maxLength={100}
        />
      </form>

      <nav className="rl-chips" aria-label="Filters">
        {chip("New Launch", "New Launch")}
        {chip("Ready to Move", "Ready")}
        <FilterSelect name="bhk" value={bhk} label="Filter by BHK" options={BHK} className={`rl-chip rl-sel${bhk ? " is-on" : ""}`} />
        <FilterSelect
          name="possession"
          value={possession}
          label="Filter by status"
          options={[{ value: "", label: "Status" }, ...POSSESSION_STATUSES.map((s) => ({ value: s, label: s }))]}
          className={`rl-chip rl-sel${possession ? " is-on" : ""}`}
        />
        <SortSelect value={sort} defaultLabel="Sort" className={`rl-chip rl-sel${sort !== "rel" ? " is-on" : ""}`} />
      </nav>

      <div className="rl-count">
        <b>{total}</b> project{total === 1 ? "" : "s"} for sale in {place}
        {q && (
          <>
            {" "}
            matching “{q}”{" "}
            <Link href={clearSearchHref} className="rl-clear">
              Clear
            </Link>
          </>
        )}
      </div>

      <main className="rl-list" aria-label="Projects">
        {items.length > 0 ? items : <div className="rl-empty">No projects match these filters yet.</div>}
        {projects.length > 0 && projects.length < 2 && ad}
      </main>
      {pagination && <div className="rl-pg">{pagination}</div>}
    </div>
  );
}
