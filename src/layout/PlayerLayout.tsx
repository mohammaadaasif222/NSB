import { useState, type CSSProperties, type FC, type ReactNode } from 'react';
import PlayerSidebar from '@/components/player/PlayerSidebar';
import PlayerTopBar from '@/components/player/PlayerTopBar';

interface Props {
  children: ReactNode;
  /**
   * Artwork painted behind the whole top of the page — under the bar and the
   * rail as well as the content — rather than inside a card. The lobby's
   * signed-out hero is the one user today.
   */
  backdrop?: ReactNode;
}

/** Rail widths, shared with the backdrop through the `--rail` custom property. */
const RAIL_EXPANDED = 205;
const RAIL_COLLAPSED = 76;

/**
 * Player-app shell: a floating bar over a floating rail and the content.
 *
 * The bar spans the whole viewport rather than sitting inside the content
 * column, so the wordmark lines up above the rail the way the design has it.
 * Both it and the rail are frosted panels with their own margins, so whatever
 * the page puts in `backdrop` reads through them.
 *
 * The stage is `isolate`d so the backdrop can sit at a negative z-index: it
 * paints above the stage's own colour but under every in-flow child, without
 * giving the content row a z-index of its own — which would trap the phone
 * drawer (fixed, z-50) underneath the sticky bar.
 *
 * The rail is a slide-in drawer below lg and a sticky column from lg up, so
 * the same tree serves phone and desktop without duplicate markup. On top of
 * that it can collapse to an icon-only column from lg up — a separate axis
 * from the mobile drawer, since a phone drawer is always shown expanded.
 */
const PlayerLayout: FC<Props> = ({ children, backdrop }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const rail = { '--rail': `${collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED}px` } as CSSProperties;

  return (
    <div className="rl-stage isolate min-h-screen text-white" style={rail}>
      {backdrop && (
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10" aria-hidden="true">
          {backdrop}
        </div>
      )}

      <PlayerTopBar
        onOpenMenu={() => setMenuOpen(true)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />

      <div className="flex gap-3 px-3 pb-3 pt-3 lg:gap-4 lg:pt-4">
        <PlayerSidebar open={menuOpen} onClose={() => setMenuOpen(false)} collapsed={collapsed} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default PlayerLayout;
