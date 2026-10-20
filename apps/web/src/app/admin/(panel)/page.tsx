import Link from "next/link";
import type { AdminCategory, Banner, Enquiry, ListingSummary, Paginated, UnreadCount } from "@nsb/shared";
import { ChevronRight, Heart, Home, ListChecks, MessageSquareText, Shapes, Star, Users } from "lucide-react";
import type { ReactNode } from "react";
import { ListingThumb, hueOf } from "@/components/admin/listing-thumb";
import { adminApi } from "@/lib/api";

const DAY = 86_400_000;
const IST = 5.5 * 3_600_000;
/** A date in India time, `days` before today, as YYYY-MM-DD (the API's date filters use India time). */
const istDate = (days: number) => new Date(Date.now() + IST - days * DAY).toISOString().slice(0, 10);

function ago(iso: string) {
  const m = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 60_000));
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}

/** Every enquiry received since `from`, a page of 100 at a time (capped, to keep the page fast). */
async function enquiriesSince(from: string) {
  const items: Enquiry[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await adminApi.get<Paginated<Enquiry>>(`/admin/enquiries?from=${from}&pageSize=100&page=${page}`);
    items.push(...res.items);
    if (items.length >= res.total || res.items.length === 0) break;
  }
  return items;
}

function Kpi({ label, value, note, icon }: { label: string; value: ReactNode; note: string; icon: ReactNode }) {
  return (
    <div className="a-card">
      <div className="a-ic">{icon}</div>
      <div>
        <span>{label}</span>
        <b>{value}</b>
        <small>{note}</small>
      </div>
    </div>
  );
}

function SectionRow({ href, icon, title, note }: { href: string; icon: ReactNode; title: string; note: string }) {
  return (
    <Link href={href} className="a-li">
      <span className="a-th" style={{ background: "var(--admin-accent)" }} aria-hidden>
        {icon}
      </span>
      <div>
        <b>{title}</b>
        <small>{note}</small>
      </div>
      <ChevronRight size={16} className="text-zinc-500" aria-hidden />
    </Link>
  );
}

export default async function DashboardPage() {
  const count = (query: string) => adminApi.get<Paginated<ListingSummary>>(`/admin/listings?pageSize=1&${query}`).then((r) => r.total);
  const [categories, banners, total, live, featured, drafts, latest, unread, recent] = await Promise.all([
    adminApi.get<AdminCategory[]>("/admin/categories"),
    adminApi.get<Banner[]>("/admin/banners"),
    count(""),
    count("status=live"),
    count("featured=true"),
    adminApi.get<Paginated<ListingSummary>>("/admin/listings?pageSize=4&status=draft"),
    adminApi.get<Paginated<Enquiry>>("/admin/enquiries?pageSize=5"),
    adminApi.get<UnreadCount>("/admin/enquiries/unread-count"),
    enquiriesSince(istDate(13)),
  ]);

  const wedding = categories.find((c) => !c.parentId && c.slug === "wedding");
  const weddingSubs = wedding ? categories.filter((c) => c.parentId === wedding.id) : [];
  const weddingLive = wedding ? await count(`status=live&categoryId=${wedding.id}`) : 0;
  const topLevel = categories.filter((c) => !c.parentId);

  // Enquiries per day for the last 14 days, oldest first, by India date.
  const days = Array.from({ length: 14 }, (_, i) => istDate(13 - i));
  const perDay = days.map((d) => recent.filter((e) => new Date(Date.parse(e.createdAt) + IST).toISOString().slice(0, 10) === d).length);
  const thisWeek = perDay.slice(7).reduce((a, n) => a + n, 0);
  const max = Math.max(1, ...perDay);

  return (
    <>
      <div className="a-hd">
        <div>
          <h2>Welcome back</h2>
          <p>A quick look at Noida, Greater Noida and Noida Extension.</p>
        </div>
      </div>

      <div className="a-kp">
        <Kpi label="Live listings" value={live} note={`of ${total} total`} icon={<ListChecks size={18} aria-hidden />} />
        <Kpi
          label="Wedding sub-categories"
          value={`${weddingSubs.filter((c) => c.isActive).length}/${weddingSubs.length}`}
          note={`${weddingLive} live wedding listings`}
          icon={<Shapes size={18} aria-hidden />}
        />
        <Kpi label="Enquiries this week" value={thisWeek} note={`${unread.unread} waiting for follow-up`} icon={<Users size={18} aria-hidden />} />
        <Kpi label="Featured listings" value={featured} note="shown first and on the home page" icon={<Star size={18} aria-hidden />} />
      </div>

      <div className="a-g2">
        <div className="a-card">
          <h3>Enquiries, last 14 days</h3>
          <svg viewBox="0 0 560 190" style={{ width: "100%", height: "auto" }} role="img" aria-label={`Enquiries per day: ${perDay.join(", ")}`}>
            <g stroke="var(--admin-line)">
              <line x1="0" y1="150" x2="560" y2="150" />
              <line x1="0" y1="100" x2="560" y2="100" strokeDasharray="3 4" />
              <line x1="0" y1="50" x2="560" y2="50" strokeDasharray="3 4" />
            </g>
            {perDay.map((n, i) => {
              const h = Math.max(4, (n / max) * 130);
              return (
                <g key={days[i]}>
                  <rect x={i * 40 + 8} y={150 - h} width="26" height={h} rx="6" fill="var(--admin-accent)" opacity={i === 13 ? 1 : 0.55}>
                    <title>{`${n} ${n === 1 ? "enquiry" : "enquiries"}`}</title>
                  </rect>
                  <text x={i * 40 + 21} y="172" textAnchor="middle" fontSize="10" fill="var(--admin-muted)">
                    {Number(days[i]!.slice(8))}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="a-card">
          <h3>Sections</h3>
          <SectionRow
            href="/admin/home"
            icon={<Home size={17} aria-hidden />}
            title="Home page"
            note={`${banners.filter((b) => b.isActive).length} hero banners live · ${topLevel.filter((c) => c.isActive).length} of ${topLevel.length} categories visible`}
          />
          <SectionRow
            href="/admin/wedding"
            icon={<Heart size={17} aria-hidden />}
            title="Wedding"
            note={`${weddingLive} live listings · ${weddingSubs.length} sub-categories`}
          />
          <SectionRow
            href="/admin/enquiries"
            icon={<MessageSquareText size={17} aria-hidden />}
            title="Enquiries"
            note={`${unread.unread} unread · ${latest.total} in total`}
          />
        </div>
      </div>

      <div className="a-g2b">
        <div className="a-card">
          <h3>Needs attention</h3>
          {drafts.items.length ? (
            drafts.items.map((l) => (
              <div key={l.id} className="a-li">
                <ListingThumb name={l.name} imageUrl={l.coverImageUrl} />
                <div>
                  <b>{l.name}</b>
                  <small>
                    Draft · {l.category.name} · {l.area}
                  </small>
                </div>
                <Link href={`/admin/listings/${l.id}`} className="a-btn s">
                  Review
                </Link>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">All clear. Nothing needs attention.</p>
          )}
        </div>
        <div className="a-card">
          <h3>
            Latest enquiries <Link href="/admin/enquiries">View all</Link>
          </h3>
          {latest.items.length ? (
            latest.items.map((e) => (
              <div key={e.id} className="a-li">
                <span className="a-th" style={{ background: `hsl(${hueOf(e.name)} 55% 45%)` }} aria-hidden>
                  {e.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <b>{e.name}</b>
                  <small>
                    {e.categoryName} · {e.listingName}
                  </small>
                </div>
                <small className="whitespace-nowrap">{ago(e.createdAt)}</small>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">No enquiries yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
