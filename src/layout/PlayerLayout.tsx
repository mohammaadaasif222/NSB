import { useState, type CSSProperties, type FC, type ReactNode } from 'react';
import PlayerSidebar from '@/components/player/PlayerSidebar';
import PlayerTopBar from '@/components/player/PlayerTopBar';
import MobileTabBar from '@/components/player/MobileTabBar';

interface Props {
  children: ReactNode;
  /**
   * Artwork painted behind the whole top of the page — under the bar and the
   * rail as well as the content — rather than inside a card. The lobby's
   * signed-out hero is the one user today.
   */
  backdrop?: ReactNode;
}

/**
 * Rail widths, shared with the backdrop through the `--rail` custom property.
 *
 * Only the collapsed width is a number here. The expanded one is
 * `--rail-expanded` in index.css, because it is not one number: 205 is the
 * design's, and a laptop steps it to 180 along with the rest of the chrome —
 * see the laptop-scale note at the top of that file. Keeping it in CSS is what
 * lets a media query reach it; a constant in this module could not be.
 */
const RAIL_COLLAPSED = 76;
const RAIL_EXPANDED = 260;

/* The rail does NOT collapse itself on a laptop. It was tried, and it is the
   wrong lever: sites of this shape keep their navigation open at 1280 and buy
   the room back from their own chrome instead. The room the account area needs
   comes out of its rail and channel — see `pages/profile/index.tsx`. */

/**
 * Player-app shell, laid out as the design does at 1920px.
 *
 * Desktop: the rail floats down the left from the top edge, and the bar and
 * the page share the column to its right — the bar sits beside the rail, not
 * above it. Phone: the bar runs the full width at the top, the rail becomes a
 * drawer, and the design's tab bar floats along the foot.
 *
 * `--u` is one design pixel. From lg up it is the viewport's share of the
 * design's 1920px frame (never more than 1px), so the rail, the bar and every
 * section sized in it shrink together on a narrower desktop and the page keeps
 * the design's proportions instead of reflowing taller. On a phone it is 1px
 * and the phone design's own sizes apply.
 *
 * The stage is `isolate`d so the backdrop can sit at a negative z-index: it
 * paints above the stage's own colour but under every in-flow child, without
 * giving the content row a z-index of its own — which would trap the phone
 * drawer (fixed, z-50) underneath the sticky bar.
 */
const PlayerLayout: FC<Props> = ({ children, backdrop }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const rail = {
    '--rail': `calc(var(--u) * ${collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED})`,
  } as CSSProperties;

  return (
    <div
      // The target for overlays that must layer among the bar and the rail —
      // inside the stage's isolation, not over the whole of it (HeaderPopover).
      data-player-stage=""
      className="rl-stage isolate min-h-screen text-white [--u:1px] lg:[--u:min(1px,calc(100vw/1920))]"
      style={rail}
    >
      {backdrop && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          {backdrop}
        </div>
      )}

      <div className="lg:flex lg:gap-[calc(var(--u)*20)] lg:p-[calc(var(--u)*20)] lg:pb-[calc(var(--u)*20)]">
        <PlayerSidebar open={menuOpen} onClose={() => setMenuOpen(false)} collapsed={collapsed} />

        <div className="min-w-0 flex-1">
          <PlayerTopBar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
          {/* Room under the phone's tab bar so the page's foot clears it. */}
          <main className="min-w-0 px-3 pb-28 pt-3 lg:px-0 lg:pb-0 lg:pt-[calc(var(--u)*16)]">
            {children}
          </main>
        </div>
      </div>

      <MobileTabBar menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} />
    </div>
  );
};

export default PlayerLayout;
