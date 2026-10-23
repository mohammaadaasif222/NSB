import Image from "next/image";
import Link from "next/link";
import type { ProjectSummary } from "@nsb/shared";
import { projectPath } from "@/lib/catalog";
import { priceText, sqftText } from "./format";
import { LeadButton } from "./lead-dialog";
import { BuildingArt } from "./project-art";
import { SaveButton, ShortsRow } from "./listing-widgets";

/** A project on the listing page, as in the NSB Live Demo. */
export function ProjectCard({ project: p }: { project: ProjectSummary }) {
  const href = projectPath(p.slug);
  return (
    <article className="re-card">
      <div className="re-img">
        <Link href={href} className="re-cover" aria-label={p.name} tabIndex={-1}>
          {p.coverImageUrl ? <Image src={p.coverImageUrl} alt={p.name} fill sizes="(max-width: 640px) 100vw, 310px" /> : <BuildingArt />}
        </Link>
        <span className={`re-bd${p.isPremium ? " p" : ""}`}>{p.isPremium ? "PREMIUM" : p.possessionStatus}</span>
        <SaveButton name={p.name} />
      </div>
      <div className="re-info">
        <div className="re-r1">
          <div>
            <h3>
              <Link href={href}>{p.name}</Link>
            </h3>
            <div className="re-by">by {p.builder}</div>
          </div>
          <div className="re-pr">
            <b>{p.minPrice ? priceText(p.minPrice) : "On request"}</b>
            {p.minPrice && <span>onwards</span>}
          </div>
        </div>
        <div className="re-lc">
          {p.locality}, {p.area}
        </div>
        {p.keyConfigurations.length > 0 && (
          <div className="re-cfg">
            {p.keyConfigurations.map((c, i) => (
              <div key={`${c.title}-${i}`}>
                <b>{c.title}</b>
                {c.superArea ? sqftText(c.superArea) : ""}
              </div>
            ))}
          </div>
        )}
        <div className="re-mt">
          <span>{p.possessionStatus}</span>
          {p.possessionDate && <span>Possession: {p.possessionDate}</span>}
          {p.reraId && <span>RERA verified</span>}
        </div>
        <div className="re-act">
          <Link href={href} className="re-btn">
            View Project
          </Link>
          <LeadButton className="re-btn o" projectId={p.id} advertiser={p.advertiserName} advertiserType={p.advertiserType} source="View Number">
            View Number
          </LeadButton>
        </div>
      </div>
    </article>
  );
}

// Static design content from the demo, between the cards. Not admin-managed yet.

export function AdStrip() {
  return (
    <a className="re-ad" href="#" aria-label="Advertisement: properties in Noida">
      <Image className="sk" src="/images/real-estate/ad-skyline.jpg" alt="" width={720} height={350} />
      <div className="tx">
        PROPERTIES IN NOIDA<small>Premium living &amp; smart real estate investment</small>
      </div>
      <Image className="wl" src="/images/real-estate/ad-wealth-clinic.jpg" alt="Wealth Clinic" width={259} height={156} />
      <span className="re-btn">Explore now ›</span>
      <em>AD</em>
    </a>
  );
}

export function PromoStrip() {
  return (
    <div className="re-ns">
      <div>
        <h3>Builders: get your project on top</h3>
        <p>Branding microsite, project reel and article on Noida Super Bazaar.</p>
      </div>
      <a className="re-btn" href="#">
        Advertise with NSB
      </a>
    </div>
  );
}

const SHORTS = [
  ["Sector 150 tour", "Skyline Heights"],
  ["Sample flat", "Green Arcade"],
  ["Amenities walk", "The Palm Court"],
  ["Site progress", "Aurum Residences"],
  ["Clubhouse", "Ivory Towers"],
];

export function ShortsStrip() {
  return (
    <div className="re-sh">
      <ShortsRow
        header={
          <div>
            <h3>
              <i />
              NSB Shorts
            </h3>
            <p>Quick walkthroughs of Noida projects</p>
          </div>
        }
      >
        {SHORTS.map(([title, project]) => (
          <button key={title} type="button" className="re-rv" aria-label={`${title}, ${project}`}>
            <span className="re-pl" aria-hidden>
              ▶
            </span>
            <div>
              {title}
              <small>{project}</small>
            </div>
          </button>
        ))}
      </ShortsRow>
      <div className="re-sf">
        <button type="button" className="re-btn">
          View all shorts ›
        </button>
      </div>
    </div>
  );
}
