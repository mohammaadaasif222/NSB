import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import {
  monthlyEmi,
  parseChapters,
  PROJECT_TYPE_LABELS,
  type ProjectDetail,
  projectPlace,
  specLine,
  textLines,
} from "@nsb/shared";
import { BackButton } from "@/components/site/back-button";
import { priceText, sqftText } from "@/components/site/real-estate/format";
import { LeadButton, LeadProvider } from "@/components/site/real-estate/lead-dialog";
import { BuildingArt } from "@/components/site/real-estate/project-art";
import { AdStrip } from "@/components/site/real-estate/project-card";
import { AboutText, Amenities, FloorPlans, MoreGrid, ProjectGallery, type ProjectVideoItem, ProjectVideos } from "@/components/site/real-estate/project-sections";
import { getProject, projectPath } from "@/lib/catalog";
import { CATEGORY_PAGES_ENABLED, COMING_SOON_METADATA } from "@/lib/flags";
import { getSiteSettings } from "@/lib/site-settings";

/** Project page, as in the NSB Live Demo: gallery, sections with sticky tabs, and a price sidebar. */

type Props = PageProps<"/real-estate/[project]">;

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section className="re-sec" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

/** The price range, rate and EMI the page shows, from the priced configurations. */
function pricing(p: ProjectDetail) {
  const prices = p.configurations.map((c) => c.price).filter((n): n is number => !!n);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const rates = p.configurations.filter((c) => c.price && c.superArea).map((c) => c.price! / c.superArea!);
  const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  return {
    min,
    range: min === null ? "Price on request" : min === max ? priceText(min) : `${priceText(min)} – ${priceText(max!)}`,
    rate: avgRate ? `₹${(avgRate / 1000).toFixed(1)}K/sq.ft` : "",
    emi: min ? `₹${Math.round(monthlyEmi(min) / 1000)}K` : "",
  };
}

/** Questions answered from the project's own fields, then the admin's. */
function faqsOf(p: ProjectDetail, min: number | null): [string, string][] {
  const prices = p.configurations.map((c) => c.price).filter((n): n is number => !!n);
  const max = prices.length ? Math.max(...prices) : null;
  const faqs: [string, string][] = [];
  if (min) faqs.push([`What is the price range of ${p.name}?`, `Prices start from ${priceText(min)}${max && max > min ? ` and go up to ${priceText(max)}` : ""}.`]);
  faqs.push(["What is the possession status?", `${p.possessionStatus || "Please contact the builder"}${p.possessionDate ? `, with possession starting ${p.possessionDate}` : ""}.`]);
  if (p.reraId) faqs.push([`Is ${p.name} RERA registered?`, `Yes. The RERA ID is ${p.reraId}. Buyers can verify it on the official UP RERA website.`]);
  faqs.push(["Who is the builder?", `${p.name} is developed by ${p.builder}.`]);
  for (const f of p.faqs) faqs.push([f.question, f.answer]);
  return faqs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!CATEGORY_PAGES_ENABLED) return COMING_SOON_METADATA;
  const p = await getProject((await params).project);
  const { range } = pricing(p);
  return {
    title: p.metaTitle || `${p.name}, ${projectPlace(p)}`,
    description:
      p.metaDescription ||
      `${p.name} by ${p.builder} in ${projectPlace(p)}: ${p.configurations.map((c) => c.title).join(", ")}. ${range}. ${p.possessionStatus}. Floor plans, photos and the builder's number.`,
    openGraph: p.photos[0] ? { images: [p.photos[0]] } : undefined,
  };
}

export default async function ProjectPage({ params }: Props) {
  const [p, { projectSideAd: ad }] = await Promise.all([getProject((await params).project), getSiteSettings()]);
  const { min, range, rate, emi } = pricing(p);
  const place = projectPlace(p);
  const lead = { projectId: p.id, advertiser: p.advertiserName, advertiserType: p.advertiserType };
  const isBroker = p.advertiserType === "broker";
  const a = p.advertiser;

  const sizes = p.configurations.map((c) => c.superArea).filter((n): n is number => !!n);
  const overview = (
    [
      ["Project size", [p.towers ? `${p.towers} towers` : "", p.units ? `${p.units} units` : ""].filter(Boolean).join(" · ")],
      ["Project area", p.landArea],
      ["Launch date", p.launchDate],
      ["Possession starts", p.possessionDate || p.possessionStatus],
      ["Configurations", p.configurations.map((c) => c.title).join(", ")],
      ["Sizes", sizes.length ? `${Math.min(...sizes).toLocaleString("en-IN")} – ${sqftText(Math.max(...sizes))}` : ""],
      ["Avg. price", rate],
      ["Property type", PROJECT_TYPE_LABELS[p.type]],
      ["RERA ID", p.reraId],
    ] as const
  ).filter(([, value]) => value);
  const about = p.about
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);
  const specs = (
    [
      ["Flooring", p.specifications.flooring],
      ["Fittings", p.specifications.fittings],
      ["Walls", p.specifications.walls],
    ] as const
  )
    .map(([title, text]) => [title, textLines(text)] as const)
    .filter(([, lines]) => lines.length);
  const videos: ProjectVideoItem[] = [
    ...(p.videoUrl ? [{ title: "Project video", url: p.videoUrl, chapters: parseChapters(p.videoChapters) }] : []),
    ...p.videos.map((v, i) => ({ title: v.title || `Video ${i + 2}`, url: v.url, chapters: parseChapters(v.chapters) })),
  ];
  const faqs = faqsOf(p, min);
  const initials = a.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  const tabs = [
    ["ov", "Overview"],
    p.configurations.length ? ["fp", "Floor Plans"] : null,
    videos.length ? ["vd", "Videos"] : null,
    p.amenities.length ? ["am", "Amenities"] : null,
    specs.length ? ["sp", "Specifications"] : null,
    p.nearby.length ? ["lc", "Around This Project"] : null,
    ["dv", "Listed by"],
    ["fq", "FAQs"],
  ].filter((t): t is [string, string] => !!t);

  const tags = (
    <div className="re-tg">
      {p.isPremium && <span>PREMIUM</span>}
      {p.isFeatured && <span className="f">FEATURED</span>}
      {p.possessionStatus && <span className="w">{p.possessionStatus}</span>}
    </div>
  );

  return (
    <div className="re has-mb">
      <LeadProvider>
        <div className="re-w">
          <div className="re-top">
            <BackButton fallback="/real-estate" />
            <nav className="re-crumb d" aria-label="Breadcrumb">
              <Link href="/">Home</Link> › <Link href="/real-estate">Real Estate</Link> › {p.area} › {p.locality} › <b aria-current="page">{p.name}</b>
            </nav>
          </div>

          <ProjectGallery name={p.name} photos={p.photos} tags={tags} />

          <div className="re-ttl">
            <div>
              <h1>
                {p.name}
                {p.reraId && (
                  <span className="re-rr" title={p.reraId}>
                    RERA
                  </span>
                )}
              </h1>
              <p className="re-by">
                By <b>{p.builder}</b>
              </p>
              <p className="lc">
                {place} · Last updated {monthYear.format(new Date(p.updatedAt))}
              </p>
            </div>
            <div className="re-tp">
              <b>{range}</b>
              <span>{[rate, emi ? `EMI starts at ${emi}` : ""].filter(Boolean).join(" · ")}</span>
            </div>
          </div>

          <nav className="re-tabs" aria-label="Sections">
            {tabs.map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>

          <div className="re-dg">
            <div>
              {p.highlights.length > 0 && (
                <Section id="ov" title={`${p.name} Highlights`}>
                  <MoreGrid
                    className="re-hl2"
                    noun="highlights"
                    items={p.highlights.slice(0, 8).map((h) => (
                      <div key={h}>
                        <Check />
                        {h}
                      </div>
                    ))}
                  />
                </Section>
              )}
              <Section id={p.highlights.length ? undefined : "ov"} title="Overview">
                <MoreGrid
                  as="dl"
                  className="re-ov"
                  noun="details"
                  phone={3}
                  items={overview.map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                />
              </Section>
              {about.length > 0 && (
                <Section title={`About ${p.name}`}>
                  <AboutText paragraphs={about} />
                </Section>
              )}
              {p.configurations.length > 0 && (
                <Section id="fp" title="Floor Plans and Pricing">
                  <FloorPlans configurations={p.configurations} lead={lead} />
                </Section>
              )}

              <AdStrip />

              {videos.length > 0 && (
                <Section id="vd" title="Project Videos">
                  <ProjectVideos videos={videos} />
                </Section>
              )}
              {p.amenities.length > 0 && (
                <Section id="am" title={`${p.name} Top Amenities`}>
                  <Amenities items={p.amenities} icon={<Check />} />
                </Section>
              )}
              {specs.length > 0 && (
                <Section id="sp" title="Specifications">
                  <div className="re-sp3">
                    {specs.map(([title, lines]) => (
                      <div key={title}>
                        <h4>{title}</h4>
                        {lines.map((line, i) => {
                          const { label, value } = specLine(line);
                          return (
                            <p key={i}>
                              {label ? (
                                <>
                                  <b>{label}</b> {value}
                                </>
                              ) : (
                                value
                              )}
                            </p>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </Section>
              )}
              {p.nearby.length > 0 && (
                <Section id="lc" title="Around This Project">
                  <MoreGrid
                    className="re-nb"
                    noun="places"
                    items={p.nearby.map((n, i) => (
                      <div key={`${n.name}-${i}`}>
                        <span>
                          {n.name}
                          {n.type && <small>{n.type}</small>}
                        </span>
                        <em>{[n.minutes ? `${n.minutes} mins` : "", n.km ? `${n.km} km` : ""].filter(Boolean).join(" · ")}</em>
                      </div>
                    ))}
                  />
                </Section>
              )}
              {p.hasBrochure && (
                <div className="re-bro">
                  <div>
                    <h3>Official Brochure</h3>
                    <p>Floor plans, amenities and payment plan in one PDF.</p>
                  </div>
                  <LeadButton {...lead} source="Brochure">
                    Download brochure
                  </LeadButton>
                </div>
              )}
              <Section id="dv" title={`Listed by ${isBroker ? "broker" : "builder"}`}>
                <div className="re-dv">
                  <div className="lg" aria-hidden>
                    {initials}
                  </div>
                  <div className="hd">
                    <b>{a.name}</b>
                    {isBroker && a.firm && <small>{a.firm}</small>}
                    <small>
                      {(isBroker
                        ? [a.experienceYears ? `${a.experienceYears} years of experience` : "", a.reraId ? `RERA agent ID ${a.reraId}` : ""]
                        : [a.established ? `Est. ${a.established}` : "", a.projectsDelivered ? `${a.projectsDelivered} projects delivered` : ""]
                      )
                        .filter(Boolean)
                        .join(" · ")}
                    </small>
                  </div>
                  <p>{a.about || (isBroker ? "A local property advisor for this project." : "A builder with residential projects across Noida and Greater Noida.")}</p>
                  {isBroker && (
                    <small className="nt">
                      Builder of this project: {p.builder}. This project is listed on NSB only with this broker.
                    </small>
                  )}
                </div>
              </Section>
              <Section id="fq" title={`FAQs about ${p.name}`}>
                {faqs.map(([q, answer]) => (
                  <details key={q}>
                    <summary>{q}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </Section>
              {p.similar.length > 0 && (
                <Section title={`Similar projects in ${p.area}`}>
                  <div className="re-sim">
                    {p.similar.map((s) => (
                      <Link key={s.id} href={projectPath(s.slug)} className="re-sc">
                        <div className="i">{s.coverImageUrl ? <Image src={s.coverImageUrl} alt="" fill sizes="(max-width: 640px) 100vw, 260px" /> : <BuildingArt />}</div>
                        <div className="b">
                          <b>{s.name}</b>
                          <span>
                            {s.locality}, {s.area}
                          </span>
                          <em>{s.minPrice ? `${priceText(s.minPrice)} onwards` : "Price on request"}</em>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            <aside className="re-side">
              <div className="re-bx">
                <div className="pr2">{min ? `${priceText(min)} onwards` : "Price on request"}</div>
                <small>{emi ? `EMI starts at ${emi} · ` : ""}Basic price</small>
                <LeadButton {...lead} source="View Number">
                  View Number
                </LeadButton>
                <LeadButton className="re-btn o" {...lead} source="Site visit">
                  Schedule a site visit
                </LeadButton>
                <div className="tr2">✓ Verified by Noida Super Bazaar</div>
              </div>
              <div className="re-bx">
                <b>Need help choosing?</b>
                <small style={{ margin: "4px 0 12px" }}>Talk to the NSB team for a shortlist.</small>
                <LeadButton className="re-btn o" {...lead} source="Callback">
                  Get a callback
                </LeadButton>
              </div>
              {ad && (
                <div className="re-bx re-xad">
                  {ad.imageUrl && (
                    <div className="xim">
                      <Image src={ad.imageUrl} alt="" fill sizes="290px" />
                    </div>
                  )}
                  <span className="xtg">Sponsored</span>
                  <b>{ad.title}</b>
                  {ad.text && <p>{ad.text}</p>}
                  {ad.link && (
                    <a className="re-btn o" href={ad.link} {...(/^https?:/.test(ad.link) ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {})}>
                      {ad.buttonLabel || "Know more"}
                    </a>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>

        <div className="re-mb">
          <div>
            <b>{min ? `${priceText(min)} onwards` : "Price on request"}</b>
            <small>{p.name}</small>
          </div>
          <LeadButton {...lead} source="View Number">
            View Number
          </LeadButton>
        </div>
      </LeadProvider>
    </div>
  );
}
