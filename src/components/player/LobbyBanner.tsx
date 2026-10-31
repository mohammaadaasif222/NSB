import {
  Component,
  useEffect,
  useRef,
  useState,
  type FC,
  type MouseEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/context/I18nContext';
import { usePlatformFeatures } from '@/context/PlatformFeaturesContext';
import { LOBBY_BANNER } from '@/constants/cdn';
import {
  fetchBanners,
  recordBannerClick,
  type Banner,
  type BannerPlacement,
} from '@/services/banners';

/** How long each slide stays before the next. */
const SLIDE_MS = 6000;
/** A horizontal drag this long turns the slide instead of opening it. */
const SWIPE_PX = 40;
/** How long the frame waits for the banners before the built-in artwork takes its place. */
const ANSWER_MS = 4000;

/*
 * One image centred and covering both frames — the design's 1548×416 on
 * desktop, 388×236 on a phone. The art is already cropped tight to the tiles,
 * so covering shows the grid at either shape; the phone used to take a hand
 * measured window out of a much wider export, which only held for that one
 * file.
 */
const FRAME =
  'group relative block aspect-[388/236] overflow-hidden rounded-[34px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/10 lg:aspect-auto lg:h-[calc(var(--u)*416)] lg:rounded-[calc(var(--u)*34)]';

/*
 * The Home page's slot sits beside the player's panel: 966×416 of the design's
 * 1548 on desktop, the full width and 168px high on a phone.
 */
const HOME_FRAME =
  'group relative block h-[168px] overflow-hidden rounded-[34px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] ring-1 ring-inset ring-white/10 lg:h-[calc(var(--u)*416)] lg:rounded-[calc(var(--u)*34)]';

/** A site path opens in place, a full link in a new tab, no link not at all. */
const SlideLink: FC<{
  banner: Banner;
  current: boolean;
  onOpen: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}> = ({ banner, current, onOpen, children }) => {
  const url = banner.link_url;
  const shared = {
    className: 'block h-full w-full',
    // A link is dragged by the browser when grabbed, which would cancel a
    // mouse swipe and leave a ghost image behind.
    draggable: false,
    // Only the slide in view takes focus; the rest are off-screen.
    tabIndex: current ? undefined : -1,
    'aria-label': banner.title,
    onClick: onOpen,
  };
  if (!url) return <div className="h-full w-full">{children}</div>;
  if (url.startsWith('/')) {
    return (
      <Link href={url} {...shared}>
        {children}
      </Link>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" {...shared}>
      {children}
    </a>
  );
};

/**
 * The banners staff set for this page. One banner stands alone; two or more
 * make a slider: autoplay that holds while the pointer or focus is on it (and
 * never under reduced motion), dots, and a swipe or drag.
 * An artwork that fails to load is reported so the page can drop it.
 */
const BannerSlider: FC<{ banners: Banner[]; frame: string; onBroken: (id: string) => void }> = ({
  banners,
  frame,
  onBroken,
}) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  // Autoplay waits while a mouse is over the slider or the keyboard is on it.
  // A touch or a click must not hold it: neither reliably "leaves" afterwards.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const held = hovered || focused;
  const swipeFrom = useRef<number | null>(null);
  const swiped = useRef(false);
  const count = banners.length;
  const current = Math.min(index, count - 1);

  const go = (next: number): void => setIndex((next + count) % count);

  // `index` restarts the clock, so a slide turned by hand gets its full time.
  useEffect(() => {
    if (count < 2 || held) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [count, held, index]);

  return (
    <section
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label={banners[current]?.title}
      // Lets a horizontal swipe reach the handlers below instead of being taken
      // as a scroll; the page still scrolls vertically.
      className={count > 1 ? `${frame} touch-pan-y` : frame}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => {
        if (e.target.matches(':focus-visible')) setFocused(true);
      }}
      onBlur={() => setFocused(false)}
      onPointerDown={(e) => {
        swipeFrom.current = e.clientX;
        swiped.current = false;
      }}
      onPointerUp={(e) => {
        if (swipeFrom.current === null || count < 2) return;
        const dx = e.clientX - swipeFrom.current;
        swipeFrom.current = null;
        if (Math.abs(dx) < SWIPE_PX) return;
        swiped.current = true;
        go(dx < 0 ? current + 1 : current - 1);
      }}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className="relative h-full w-full flex-shrink-0"
            aria-roledescription={count > 1 ? 'slide' : undefined}
            aria-hidden={i !== current}
          >
            <SlideLink
              banner={banner}
              current={i === current}
              onOpen={(event) => {
                // The pointer lifted at the end of a swipe turned the slide; it
                // is not a click on the link, so neither open nor count it.
                if (swiped.current) {
                  swiped.current = false;
                  event.preventDefault();
                  return;
                }
                recordBannerClick(banner.id);
              }}
            >
              <picture>
                {banner.mobile_image_url && (
                  <source media="(max-width: 1023px)" srcSet={banner.mobile_image_url} />
                )}
                {/* Staff uploads live on the asset CDN; a plain <img> keeps the
                    image optimiser's host allowlist out of it. */}
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  draggable={false}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  onError={() => onBroken(banner.id)}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </picture>
            </SlideLink>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:bottom-[calc(var(--u)*18)]">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              aria-label={t('lobby.banner.slide', { n: i + 1, total: count })}
              aria-current={i === current}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

/** If the banners cannot be drawn, the page keeps its built-in artwork rather than breaking. */
class BannerBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The lobby artwork the Casino, Live Casino and Sports pages had before banners
 * were managed: it opens the promotions page, and goes with it when promotions
 * are off.
 */
const BuiltInBanner: FC = () => {
  const { t } = useTranslation();
  const { promotions: promotionsOn } = usePlatformFeatures();

  if (!promotionsOn) {
    return null;
  }

  return (
    <Link href="/promotions" aria-label={t('menu.promotions')} className={FRAME}>
      <Image
        src={LOBBY_BANNER}
        alt={t('menu.promotions')}
        priority
        sizes="(max-width: 1023px) 100vw, 1548px"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
      />
    </Link>
  );
};

/**
 * The Home, Casino, Live Casino and Sports pages' banner. Staff set it from
 * the console's Banners page, one set per page: one banner stands alone,
 * several make a slider. The page's built-in artwork (`fallback`) stands in
 * whenever there is nothing to show — none is live for this viewer, the
 * request fails or is slow, an image will not load, or the slider itself
 * breaks. Home passes its own; the others use the lobby artwork.
 */
const LobbyBanner: FC<{ placement: BannerPlacement; fallback?: ReactNode }> = ({
  placement,
  fallback,
}) => {
  const frame = placement === 'home' ? HOME_FRAME : FRAME;
  const { locale } = useTranslation();
  const { token, hydrated } = useAuth();
  // Null until the answer arrives: the frame holds the space meanwhile.
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [broken, setBroken] = useState<string[]>([]);

  useEffect(() => {
    // Wait for the stored session, or a signed-in player would first get the
    // signed-out answer.
    if (!hydrated) return undefined;
    let active = true;
    // A slow answer must not leave a grey box: after a while the built-in
    // artwork shows, and the banners replace it if they do arrive.
    const timer = window.setTimeout(() => {
      if (active) setBanners((rows) => rows ?? []);
    }, ANSWER_MS);
    void fetchBanners(placement, locale, token).then((rows) => {
      window.clearTimeout(timer);
      if (active) setBanners(rows);
    });
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [placement, locale, token, hydrated]);

  if (banners === null) {
    return <div aria-hidden="true" className={`${frame} bg-white/5`} />;
  }

  const showing = banners.filter((banner) => !broken.includes(banner.id));
  const builtIn = fallback === undefined ? <BuiltInBanner /> : fallback;

  if (showing.length === 0) {
    return builtIn;
  }

  return (
    <BannerBoundary key={showing.map((banner) => banner.id).join()} fallback={builtIn}>
      <BannerSlider
        banners={showing}
        frame={frame}
        onBroken={(id) => setBroken((ids) => (ids.includes(id) ? ids : [...ids, id]))}
      />
    </BannerBoundary>
  );
};

export default LobbyBanner;
