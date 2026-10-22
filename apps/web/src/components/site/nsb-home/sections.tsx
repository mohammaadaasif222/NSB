import Image from "next/image";
import Link from "next/link";
import { HomeLink, Icon } from "./bits";
import {
  BRANDS,
  CATEGORIES,
  DEALS,
  FAQS,
  HIGHLIGHTS,
  HOW_IT_WORKS,
  ICON,
  JOHRI,
  LOGO,
  MARKETS,
  PICKS,
  PRODUCTS,
  QUICK_LINKS,
  SOCIALS,
  TILES,
  TRUST,
} from "./content";
import { type HeroSlide, HeroSlides } from "./hero-slides";
import { LocationMenu } from "./location-menu";

/** Header from the demo. Search, cart and login are shown as designed but not wired up (not Phase-1). */
export function HomeHeader() {
  return (
    <header className="hd">
      <div className="w bar">
        <Link className="logo" href="/" aria-label="Noida Super Bazaar">
          <Image src={LOGO} alt="Noida Super Bazaar" width={560} height={283} priority />
        </Link>
        <label className="sb">
          <Icon d={ICON.search} size={18} />
          <input type="search" placeholder="Search wedding venues, salons, AC repair…" aria-label="Search" />
        </label>
        <LocationMenu />
        <a className="ct" href="#" aria-label="Cart">
          <Icon d={ICON.bag} />
          <i>0</i>
        </a>
        <a className="lg" href="#">
          Login
        </a>
      </div>
    </header>
  );
}

export function HeroBanners({ slides }: { slides: HeroSlide[] }) {
  return (
    <div className="hb">
      <div className="w">
        <div className="hgrid">
          <HeroSlides slides={slides} />
          <div className="hq">
            {TILES.map((t) => (
              <HomeLink key={t.title} className={`q ${t.cls}`} href={t.link}>
                <Icon d={t.icon} size={26} />
                <div className="qb">
                  <b>{t.title}</b>
                  <i>
                    <Icon d={ICON.arrow} size={14} />
                  </i>
                </div>
              </HomeLink>
            ))}
          </div>
        </div>
        <div className="tr">
          {TRUST.map((t) => (
            <a key={t.title} href="#">
              <span>
                <Icon d={t.icon} />
              </span>
              <div>
                <b>{t.title}</b>
                <small>{t.text}</small>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Categories() {
  return (
    <section id="categories">
      <div className="w">
        <div className="sh">
          <h2>Browse by category</h2>
        </div>
        <div className="cats">
          {CATEGORIES.map((c) => {
            const body = (
              <>
                <span className="ci">
                  <Icon d={c.icon} size={26} />
                </span>
                <b>{c.name}</b>
                {c.sub && <small>{c.sub}</small>}
              </>
            );
            return c.link ? (
              <Link key={c.name} className={`cat live${c.wedding ? " wed" : ""}`} href={c.link}>
                <span className="lv">
                  <i />
                  Live
                </span>
                {body}
                {c.wedding && (
                  <span className="cf">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </Link>
            ) : (
              <div key={c.name} className="cat soon" aria-disabled="true">
                <span className="sn">Soon</span>
                {body}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PopularMarkets() {
  return (
    <section className="alt">
      <div className="w">
        <div className="sh">
          <div>
            <h2>Popular markets in Noida</h2>
            <p>Discover local shops and services by area</p>
          </div>
          <a className="lk" href="#">
            View all markets
          </a>
        </div>
        <div className="mkr">
          {MARKETS.map((m) => (
            <a key={m.name} className="mkc" href="#">
              <span className={`av ${m.g}`}>
                <Icon d={ICON.pin} size={30} />
              </span>
              <b>{m.name}</b>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Highlights() {
  return (
    <section>
      <div className="w">
        <div className="hls">
          {HIGHLIGHTS.map((h) => (
            <a key={h.title} className={`hl ${h.g}`} href="#">
              <div>
                <h3>{h.title}</h3>
                <p>Limited time offers</p>
              </div>
              <span className="go">
                Explore more <Icon d={ICON.arrow} size={16} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TopPicks() {
  return (
    <section style={{ paddingTop: 6 }}>
      <div className="w">
        <div className="sh">
          <div>
            <h2>NSB Verified – Top picks</h2>
            <p>Discover local shops and services by area</p>
          </div>
          <a className="lk" href="#">
            View more
          </a>
        </div>
        <div className="pks">
          {PICKS.map((p) => (
            <article key={p.name} className="pk">
              <div className="pimg has-img" style={p.style}>
                <span className="vf">
                  <Icon d={ICON.shield} size={14} />
                  Verified
                </span>
              </div>
              <div className="pb">
                <div className="rt">
                  <Icon d={ICON.star} size={14} />
                  <b>4.8</b>
                  <span>(320)</span>
                </div>
                <h3>{p.name}</h3>
                <p>{p.area}</p>
                <em>{p.category}</em>
                <a className="btn sm" href="#">
                  View profile
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandStores() {
  return (
    <section className="alt" id="brands">
      <div className="w">
        <div className="sh">
          <div>
            <h2>Brand stores</h2>
            <p>Shop from trusted brands, delivered the same day</p>
          </div>
          <div className="ctl">
            <span className="sd">
              <Icon d={ICON.truck} size={16} />
              Same-day delivery in Noida
            </span>
            <a className="lk" href="#">
              Explore all brands
            </a>
          </div>
        </div>
        <div className="brs">
          {BRANDS.map((b) => (
            <a key={b.name} className="br" href="#">
              <span className="bl lgi" style={{ backgroundImage: `url(${b.logo})` }} />
              <span className="bt">
                <b>{b.name}</b>
                <small>Visit store →</small>
              </span>
            </a>
          ))}
        </div>
        <div className="prods">
          {PRODUCTS.map((p) => (
            <article key={p.name} className="pd">
              <div className="pimg has-img" style={{ backgroundImage: `url(${p.image})` }}>
                <span className="sdl">
                  <Icon d={ICON.truck} size={16} />
                  Same-day
                </span>
              </div>
              <span className="dc">{p.off}</span>
              <div className="pb">
                <small>{p.brand}</small>
                <h3>{p.name}</h3>
                <div className="pf">
                  <div className="pr">
                    <b>{p.price}</b>
                    <s>{p.mrp}</s>
                  </div>
                  <button type="button" className="btn sm">
                    <Icon d={ICON.cart} size={16} />
                    Add to cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="how">
          {HOW_IT_WORKS.map((h, i) => (
            <div key={h.title}>
              <i>{i + 1}</i>
              <span>
                <b>{h.title}</b>
                {h.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JohriBazaar() {
  return (
    <section id="johri">
      <div className="w">
        <div className="jb">
          <div className="jl">
            <span className="jtag">Premium bazaar</span>
            <h2>NSB Johri Bazaar</h2>
            <hr />
            <p>Noida&apos;s jewellers, together in one premium marketplace.</p>
            <a className="btn gold" href="#">
              Explore jewellers
            </a>
          </div>
          <div className="jr">
            {JOHRI.map((j) => (
              <a key={j.title} className="jt" href="#">
                <Icon d={ICON.gem} size={34} />
                <b>{j.title}</b>
                <span>{j.text}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BestDeals() {
  return (
    <section style={{ paddingTop: 6 }}>
      <div className="w">
        <div className="sh">
          <div>
            <h2>Today&apos;s best deals</h2>
            <p>Flash offers updated daily. Grab them before they&apos;re gone.</p>
          </div>
        </div>
        <div className="dls">
          {DEALS.map((d) => (
            <article key={d.name} className="dl">
              <div className="pimg has-img" style={{ backgroundImage: `url(${d.image})`, backgroundPosition: d.position }}>
                <span className="off">30% OFF</span>
              </div>
              <div className="pb">
                <h3>{d.name}</h3>
                <p>{d.text}</p>
                <small>
                  <Icon d={ICON.pin} size={14} />
                  {d.area}
                </small>
                <a className="btn sm" href="#">
                  Claim now
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faqs() {
  return (
    <section className="faqs" id="faq">
      <div className="w">
        <div className="fqg">
          <div className="fqh">
            <small>Need help?</small>
            <h2>Frequently asked questions</h2>
            <p>Everything you need to know about Noida Super Bazaar.</p>
            <a className="btn" href="#">
              Contact us
            </a>
          </div>
          <div className="fql">
            {FAQS.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeFooter() {
  return (
    <footer>
      <div className="w">
        <div className="fg">
          <div>
            <Link href="/" aria-label="Noida Super Bazaar">
              <Image className="flg" src={LOGO} alt="Noida Super Bazaar" width={560} height={283} />
            </Link>
            <p>Your trusted hyperlocal discovery platform for Noida. Connecting you with verified local businesses and services.</p>
            <div className="tb">
              <span>
                <Icon d={ICON.shield} size={22} stroke={1.8} />
              </span>
              <div>
                <b>Trusted by local businesses</b>
                <div className="sr">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon key={n} d={ICON.star} size={14} fill="#F5B301" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4>
              <Icon d={ICON.store} size={16} stroke={1.8} />
              Quick links
            </h4>
            <ul className="fl2">
              {QUICK_LINKS.map((l) => (
                <li key={l}>
                  <a href="#">
                    <Icon d={ICON.chevronRight} size={14} stroke={1.8} />
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>
              <Icon d={ICON.grid} size={16} stroke={1.8} />
              Categories
            </h4>
            <ul className="fl2">
              {CATEGORIES.filter((c) => c.link).map((c) => (
                <li key={c.name}>
                  <Link href={c.link!}>
                    <Icon d={ICON.chevronRight} size={14} stroke={1.8} />
                    {c.name}
                  </Link>
                </li>
              ))}
              <li className="mu">More opening soon</li>
            </ul>
          </div>
        </div>
        <div className="fbar">
          <div className="so">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                <Icon d={s.icon} size={18} stroke={1.8} />
              </a>
            ))}
          </div>
          <div className="cp">
            © {new Date().getFullYear()} Noida Super Bazaar. All rights reserved. <a href="#">Terms</a> · <a href="#">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Bottom bar on phones. The WhatsApp tab appears only when it is set up in Admin › Settings. */
export function BottomNav({ whatsappHref }: { whatsappHref: string | null }) {
  return (
    <nav className="bn" aria-label="Quick links">
      <Link href="/">
        <Icon d={ICON.home} />
        Home
      </Link>
      <a href="#categories">
        <Icon d={ICON.grid} />
        Categories
      </a>
      <Link href="/wedding">
        <Icon d={ICON.heart} />
        Wedding
      </Link>
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <Icon d={ICON.chat} />
          WhatsApp
        </a>
      )}
    </nav>
  );
}
