import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { PROJECT_TYPE_LABELS, type ProjectDetail } from "@nsb/shared";
import { poppins } from "@/lib/fonts";
import { projectPath } from "@/lib/catalog";
import { priceText, sqftText } from "./format";
import { LeadButton, type LeadTarget } from "./lead-dialog";
import { BuildingArt } from "./project-art";
import { BrokerRera, CopyButton, FloorPlanCards, HeroGallery, ReadMore, SectionTabs, ShowMore, type VideoTile, VideoTiles } from "./project-mobile-client";
import "./project-mobile.css";

/**
 * The project page on phones, after real-esatate-details-page-mobile.html: photos with a sheet over
 * them, sticky section tabs, one section per block and a fixed price bar. Every value comes from
 * the project; sections without data are left out. Wider screens keep the desktop page.
 */

const svg = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden>
    {d}
  </svg>
);
/** Overview tile icons from the design. */
const OI = {
  calendar: svg(
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>,
  ),
  home: svg(<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />),
  bed: svg(<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />),
  size: svg(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h6M9 3v6" />
    </>,
  ),
  tag: svg(
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.2" />
    </>,
  ),
  building: svg(<path d="M5 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17M15 9h4a1 1 0 0 1 1 1v11M3 21h18M9 7h2M9 11h2M9 15h2" />),
  land: svg(<path d="M3 20h18M5 20l4-9 4 5 3-4 3 8" />),
  shield: svg(
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>,
  ),
};
const PIN = svg(
  <>
    <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </>,
);

/** Amenity emoji by the words in its name, as in the design; ✨ for anything else. */
const AMENITY_ICONS: [RegExp, string][] = [
  [/pool|swim/i, "🏊"],
  [/gym|fitness/i, "🏋️"],
  [/club/i, "🏛️"],
  [/kid|child|play/i, "🧸"],
  [/jog|walk|track/i, "🏃"],
  [/cctv|camera/i, "📹"],
  [/secur|guard/i, "🛡️"],
  [/power|backup/i, "🔌"],
  [/garden|landscap|park(?!ing)|green/i, "🌳"],
  [/indoor|games/i, "🎲"],
  [/yoga|medit/i, "🧘"],
  [/theat|cinema/i, "🎬"],
  [/cricket/i, "🏏"],
  [/basket|court|tennis|badminton/i, "🏀"],
  [/skat/i, "⛸️"],
  [/pet/i, "🐕"],
  [/party|lawn|banquet/i, "🎉"],
  [/senior/i, "🧓"],
  [/ev|charg/i, "⚡"],
  [/rain|water/i, "💧"],
  [/library|read/i, "📚"],
  [/co-?work|business/i, "💻"],
  [/hall|multipurpose/i, "🏢"],
  [/parking/i, "🅿️"],
  [/lift|elevator/i, "🛗"],
  [/spa|sauna|steam/i, "🧖"],
];
const amenityIcon = (name: string) => AMENITY_ICONS.find(([re]) => re.test(name))?.[1] ?? "✨";

/** Nearby place emoji by its type or name. */
const NEAR_ICONS: [RegExp, string][] = [
  [/school|college|universit/i, "🏫"],
  [/hospital|clinic|medical/i, "🏥"],
  [/metro|station|rail/i, "🚇"],
  [/mall|market|shop/i, "🛍️"],
  [/airport/i, "✈️"],
  [/park/i, "🌳"],
  [/highway|expressway|road/i, "🛣️"],
  [/office|it park|tech/i, "🏢"],
];
const nearIcon = (text: string) => NEAR_ICONS.find(([re]) => re.test(text))?.[1] ?? "📍";

/** Highlight card colours, cycling. */
const HL_COLORS = [
  ["#3b2fe0", "#0b0b3b"],
  ["#0e7490", "#1e3a8a"],
  ["#7c3aed", "#2410d6"],
  ["#1d4ed8", "#0b0b3b"],
];

export interface ProjectMobileProps {
  project: ProjectDetail;
  range: string;
  rate: string;
  emi: string;
  min: number | null;
  faqs: [string, string][];
  videos: VideoTile[];
  specs: (readonly [string, { label: string | null; value: string }[]])[];
  updated: string;
  initials: string;
  lead: Omit<LeadTarget, "source">;
  /** The admin's ad banner, after the floor plans. */
  ad: ReactNode;
}

export function ProjectMobile({ project: p, range, rate, emi, min, faqs, videos, specs, updated, initials, lead, ad }: ProjectMobileProps) {
  const a = p.advertiser;
  const isBroker = p.advertiserType === "broker";
  const place = `${p.locality}, ${p.area}`;
  const sizeList = p.configurations.map((c) => c.superArea).filter((n): n is number => !!n);
  const sizes = sizeList.length
    ? Math.min(...sizeList) === Math.max(...sizeList)
      ? sqftText(sizeList[0]!)
      : `${Math.min(...sizeList).toLocaleString("en-IN")} – ${sqftText(Math.max(...sizeList))}`
    : "";
  const configs = p.configurations.map((c) => c.title).join(", ");
  const about = p.about
    .split(/\n+/)
    .map((x) => x.trim())
    .filter(Boolean);

  const tiles = (
    [
      ["Launch date", p.launchDate, OI.calendar],
      ["Possession starts", p.possessionDate || p.possessionStatus, OI.home],
      ["Configurations", configs, OI.bed],
      ["Sizes", sizes, OI.size],
      ["Avg. price", rate, OI.tag],
      ["Property type", PROJECT_TYPE_LABELS[p.type], OI.building],
      ["Project size", [p.towers ? `${p.towers} towers` : "", p.units ? `${p.units} units` : ""].filter(Boolean).join(" · "), OI.building],
      ["Project area", p.landArea, OI.land],
    ] as const
  ).filter(([, value]) => value);
  const overview: ReactNode[] = [
    ...tiles.map(([label, value, icon]) => (
      <div key={label} className="pm-ot">
        <i className="pm-oi">{icon}</i>
        <div>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      </div>
    )),
    ...(p.reraId
      ? [
          <div key="rera" className="pm-rcard">
            <div className="pm-rc-top">
              <i className="pm-oi">{OI.shield}</i>
              <div>
                <span className="pm-rl">RERA ID · Registered</span>
                <div className="pm-rid">{p.reraId}</div>
              </div>
            </div>
            <div className="pm-rc-act">
              <CopyButton text={p.reraId} />
              <a href="https://www.up-rera.in" target="_blank" rel="noopener noreferrer">
                Verify on UP RERA ↗
              </a>
            </div>
          </div>,
        ]
      : []),
  ];

  const tabs = [
    { id: "m-ov", label: "Overview" },
    videos.length ? { id: "m-vd", label: "Videos" } : null,
    p.configurations.length ? { id: "m-fp", label: "Floor Plans" } : null,
    p.amenities.length ? { id: "m-am", label: "Amenities" } : null,
    specs.length ? { id: "m-sp", label: "Specifications" } : null,
    p.nearby.length ? { id: "m-lc", label: "Around" } : null,
    { id: "m-dv", label: "Listed by" },
    { id: "m-fq", label: "FAQs" },
  ].filter((t): t is { id: string; label: string } => !!t);
  const jumps = [
    { id: "m-top", label: "Photos" },
    ...(videos.length ? [{ id: "m-vd", label: "Video" }] : []),
    ...(p.configurations.length ? [{ id: "m-fp", label: "Floor plan" }] : []),
  ];
  const facts = (
    [
      [configs ? `${configs}` : "", "Configurations"],
      [p.possessionStatus, "Possession Status"],
      [rate, "Avg. Price"],
      [sizes, "Sizes"],
    ] as const
  ).filter(([value]) => value);
  const advertiserLine = (
    isBroker
      ? [a.firm, a.experienceYears ? `${a.experienceYears} years of experience` : ""]
      : [a.established ? `Est. ${a.established}` : "", a.projectsDelivered ? `${a.projectsDelivered} projects delivered` : ""]
  )
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`pm ${poppins.variable}`}>
      <HeroGallery name={p.name} photos={p.photos} jumps={jumps} />

      <div className="pm-sec pm-title">
        <div className="pm-badges">
          {p.reraId && (
            <span className="pm-bd is-g">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              RERA Verified
            </span>
          )}
          {p.isPremium && <span className="pm-bd is-p">★ Premium</span>}
          {p.isFeatured && <span className="pm-bd is-p">Featured</span>}
          {p.possessionStatus && <span className="pm-bd is-b">{p.possessionStatus}</span>}
        </div>
        <h1>{p.name}</h1>
        <div className="pm-by">
          By <b>{p.builder}</b>
        </div>
        <div className="pm-loc">
          {PIN}
          {place} · Last updated {updated}
        </div>
        <div className="pm-price">
          <div className="pm-prl">Price range</div>
          <div className="pm-pf">{range}</div>
          {emi && (
            <div className="pm-emi1">
              EMI starts at <b>{emi}</b>
            </div>
          )}
          {facts.length > 0 && (
            <div className="pm-hd">
              {facts.map(([value, label]) => (
                <div key={label}>
                  <b>{value}</b>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SectionTabs tabs={tabs} />

      {p.highlights.length > 0 && (
        <div className="pm-sec">
          <h2>{p.name} Highlights</h2>
          <div className="pm-hs">
            {p.highlights.map((h, i) => {
              const [from, to] = HL_COLORS[i % HL_COLORS.length]!;
              return (
                <div key={`${h}-${i}`} className="pm-hl" style={{ "--a": from, "--b": to } as CSSProperties}>
                  <i>✓</i>
                  {h}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pm-sec" id="m-ov">
        <h2>Overview</h2>
        <ShowMore className="pm-ovg" items={overview} shown={4} noun="details" />
      </div>

      {videos.length > 0 && (
        <div className="pm-sec" id="m-vd">
          <h2>Project Videos</h2>
          <VideoTiles videos={videos} />
        </div>
      )}

      {about.length > 0 && (
        <div className="pm-sec pm-about">
          <h2>About {p.name}</h2>
          <ReadMore paragraphs={about} />
        </div>
      )}

      {p.configurations.length > 0 && (
        <div className="pm-sec" id="m-fp">
          <FloorPlanCards configurations={p.configurations} possession={p.possessionDate} lead={lead} />
        </div>
      )}

      <div className="pm-adw">{ad}</div>

      {p.amenities.length > 0 && (
        <div className="pm-sec" id="m-am">
          <h2>{p.name} Top Amenities</h2>
          <ShowMore
            className="pm-am"
            shown={8}
            noun="amenities"
            items={p.amenities.map((name, i) => (
              <div key={`${name}-${i}`}>
                <i>{amenityIcon(name)}</i>
                {name}
              </div>
            ))}
          />
        </div>
      )}

      {specs.length > 0 && (
        <div className="pm-sec" id="m-sp">
          <h2>Specifications</h2>
          {specs.map(([title, lines]) => (
            <div key={title} className="pm-pc">
              <h3>{title}</h3>
              <dl>
                {lines.map((l, i) => (
                  <div key={i}>
                    {l.label && <dt>{l.label}</dt>}
                    <dd>{l.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}

      {p.nearby.length > 0 && (
        <div className="pm-sec" id="m-lc">
          <h2>Around This Project</h2>
          {p.nearby.map((n, i) => {
            const time = [n.minutes ? `${n.minutes} mins` : "", n.km ? `${n.km} km` : ""].filter(Boolean).join(" · ");
            return (
              <div key={`${n.name}-${i}`} className="pm-near">
                <i>{nearIcon(`${n.type} ${n.name}`)}</i>
                <div>
                  <b>{n.name}</b>
                  {n.type && <span>{n.type}</span>}
                </div>
                {time && <em>{time}</em>}
              </div>
            );
          })}
        </div>
      )}

      {p.hasBrochure && (
        <div className="pm-help">
          <div>
            <b>Official Brochure</b>
            <p>Floor plans, amenities and payment plan in one PDF.</p>
          </div>
          <LeadButton className="pm-help-b" {...lead} source="Brochure">
            Download
          </LeadButton>
        </div>
      )}

      <div className="pm-sec" id="m-dv">
        <h2>Listed by {isBroker ? "broker" : "builder"}</h2>
        <div className="pm-br">
          <div className="pm-av">{initials}</div>
          <div>
            <b>
              {a.name}
              {isBroker && a.reraId && <BrokerRera name={a.name} firm={a.firm} reraId={a.reraId} />}
            </b>
            {advertiserLine && <span>{advertiserLine}</span>}
          </div>
        </div>
        {a.about && <p className="pm-dva">{a.about}</p>}
        {isBroker && (
          <div className="pm-note">
            Builder of this project: <b>{p.builder}</b>. This project is listed on NSB only with this broker.
          </div>
        )}
      </div>

      <div className="pm-sec" id="m-fq">
        <h2>FAQs about {p.name}</h2>
        {faqs.map(([q, answer], i) => (
          <details key={`${q}-${i}`}>
            <summary>{q}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>

      {p.similar.length > 0 && (
        <div className="pm-sec">
          <h2>Similar projects in {p.area}</h2>
          <div className="pm-sim">
            {p.similar.map((s) => (
              <Link key={s.id} href={projectPath(s.slug)} className="pm-sc">
                <div className="pm-sci">{s.coverImageUrl ? <Image src={s.coverImageUrl} alt="" fill sizes="200px" /> : <BuildingArt />}</div>
                <b>{s.name}</b>
                <span>
                  {s.locality}, {s.area}
                </span>
                <em>{s.minPrice ? `${priceText(s.minPrice)} onwards` : "Price on request"}</em>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="pm-help">
        <div>
          <b>Need help choosing?</b>
          <p>Talk to the NSB team for a shortlist.</p>
        </div>
        <LeadButton className="pm-help-b" {...lead} source="Callback">
          Get callback
        </LeadButton>
      </div>

      <div className="pm-cta">
        <div className="pm-t">
          <b>{min ? priceText(min) : "Price on request"}</b>
          <span>{[min ? "Onwards" : "", emi ? `EMI from ${emi}` : ""].filter(Boolean).join(" · ") || p.name}</span>
        </div>
        <div className="pm-row2">
          <LeadButton className="pm-btn is-o" {...lead} source="Site visit">
            Site visit
          </LeadButton>
          <LeadButton className="pm-btn" {...lead} source="View Number">
            View Number
          </LeadButton>
        </div>
      </div>
    </div>
  );
}
