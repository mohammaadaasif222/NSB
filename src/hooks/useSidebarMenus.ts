import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { resolveSidebarIcon } from '@/components/sidebar/iconRegistry';
import {
  DEFAULT_SIDEBAR_BLOCKS,
  SIDEBAR_ACTIONS,
  type LobbyChip,
  type LobbyChipSet,
  type SidebarAction,
  type SidebarBlocks,
  type SidebarGroup,
  type SidebarItem,
  type SidebarSection,
} from '@/constants/sidebarMenu';
import {
  getPublicSidebarMenus,
  peekSidebarMenus,
  type PublicLobbyChip,
  type PublicSidebarGroup,
  type PublicSidebarItem,
  type PublicSidebarMenu,
} from '@/services/sidebarMenus';

const section = (value: string): SidebarSection =>
  value === 'casino' || value === 'sports' ? value : 'all';

const action = (value: string | null): SidebarAction | undefined =>
  (SIDEBAR_ACTIONS as readonly string[]).includes(value ?? '')
    ? (value as SidebarAction)
    : undefined;

const toItem = (row: PublicSidebarItem): SidebarItem => ({
  id: row.id,
  labelKey: row.label_key ?? undefined,
  label: row.label ?? undefined,
  labelTranslations: row.label_translations ?? undefined,
  icon: resolveSidebarIcon(row.icon_key, row.icon_url),
  href: row.link ?? undefined,
  action: action(row.action),
  requireAuth: row.require_auth,
  featureFlag: row.feature_flag ?? undefined,
  section: section(row.section),
});

const toGroups = (tree: PublicSidebarGroup[] | undefined): SidebarGroup[] | null => {
  if (!tree || tree.length === 0) return null;
  return tree.map((g) => ({
    id: g.id,
    titleKey: g.title_key ?? undefined,
    title: g.title ?? undefined,
    icon: resolveSidebarIcon(g.icon_key, g.icon_url),
    href: g.link ?? undefined,
    layout: g.layout === 'flat' ? 'flat' : 'group',
    section: section(g.section),
    items: g.items.map(toItem),
  }));
};

/** Blocks the API did not send keep their built-in settings. */
const toBlocks = (menu: PublicSidebarMenu | null): SidebarBlocks => {
  const blocks = { ...DEFAULT_SIDEBAR_BLOCKS };
  for (const row of menu?.blocks ?? []) {
    if (row.key !== 'welcome' && row.key !== 'socials' && row.key !== 'suggestion') continue;
    blocks[row.key] = {
      enabled: row.enabled,
      label: row.label ?? undefined,
      labelTranslations: row.label_translations ?? undefined,
      amount: row.amount ?? undefined,
      note: row.note ?? undefined,
    };
  }
  return blocks;
};

const toChips = (rows: PublicLobbyChip[] | undefined): LobbyChip[] | null => {
  if (!rows || rows.length === 0) return null;
  return rows.map((row) => ({
    id: row.id,
    key: row.key ?? undefined,
    labelKey: row.label_key ?? undefined,
    label: row.label ?? undefined,
    labelTranslations: row.label_translations ?? undefined,
    icon: row.icon_key || row.icon_url ? resolveSidebarIcon(row.icon_key, row.icon_url) : undefined,
    href: row.link ?? undefined,
    action: action(row.action),
    requireAuth: row.require_auth,
    featureFlag: row.feature_flag ?? undefined,
  }));
};

export interface SidebarMenus {
  /** null: draw the built-in DEFAULT_SIDEBAR_MENU. */
  groups: SidebarGroup[] | null;
  /** Always set: the API's, or the built-in DEFAULT_SIDEBAR_BLOCKS. */
  blocks: SidebarBlocks;
  /** Per bar; null: draw that bar's built-in chips. */
  chips: Record<LobbyChipSet, LobbyChip[] | null>;
}

const toMenus = (menu: PublicSidebarMenu | null): SidebarMenus => ({
  groups: toGroups(menu?.groups),
  blocks: toBlocks(menu),
  chips: { casino: toChips(menu?.chips?.casino), live: toChips(menu?.chips?.live) },
});

/**
 * The side menu written in CRM -> Sidebar menus, in the rail's own shape.
 *
 * `groups` is null while loading, on error with nothing fetched yet, or when
 * the API has no menu: the caller then draws the built-in DEFAULT_SIDEBAR_MENU.
 * The fetch is shared and cached for 30s (see services/sidebarMenus), and asked
 * again on every page change and when the tab comes back, so an operator's
 * edit shows up without a reload.
 */
export const useSidebarMenus = (): SidebarMenus => {
  const router = useRouter();
  const [menus, setMenus] = useState<SidebarMenus>(() => toMenus(peekSidebarMenus()));

  useEffect(() => {
    let cancelled = false;
    let last: PublicSidebarMenu | null | undefined;

    const refresh = (): void => {
      void getPublicSidebarMenus().then((menu) => {
        // The cache hands back the same object until it refetches: skip re-renders.
        if (cancelled || menu === last) return;
        last = menu;
        setMenus(toMenus(menu));
      });
    };
    const onVisible = (): void => {
      if (document.visibilityState === 'visible') refresh();
    };

    refresh();
    router.events.on('routeChangeComplete', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      router.events.off('routeChangeComplete', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [router.events]);

  return menus;
};
