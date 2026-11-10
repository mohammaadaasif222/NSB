import apiService from '@/services/api';

export interface PublicSidebarItem {
  id: string;
  label_key: string | null;
  label: string | null;
  label_translations: Record<string, string> | null;
  icon_key: string | null;
  icon_url: string | null;
  link: string | null;
  action: string | null;
  require_auth: boolean;
  feature_flag: string | null;
  section: string;
}

export interface PublicSidebarGroup {
  id: string;
  title_key: string | null;
  title: string | null;
  icon_key: string | null;
  icon_url: string | null;
  link: string | null;
  layout: string;
  section: string;
  items: PublicSidebarItem[];
}

/** A fixed block of the rail: welcome | socials | suggestion. */
export interface PublicSidebarBlock {
  key: string;
  enabled: boolean;
  label: string | null;
  label_translations: Record<string, string> | null;
  amount: string | null;
  note: string | null;
}

export interface PublicSidebarMenu {
  /** Empty: the rail draws its built-in menu. */
  groups: PublicSidebarGroup[];
  blocks: PublicSidebarBlock[];
}

/** Console edits reach players within this long, without a reload. */
export const SIDEBAR_CACHE_MS = 30_000;

let cache: { at: number; value: PublicSidebarMenu | null } | null = null;
let inFlight: Promise<PublicSidebarMenu | null> | null = null;

/** The last menu fetched, without asking the API — for a first render without flicker. */
export const peekSidebarMenus = (): PublicSidebarMenu | null => cache?.value ?? null;

const normalise = (data: unknown): PublicSidebarMenu | null => {
  // An API from before the fixed blocks answered with the bare group list.
  if (Array.isArray(data)) return { groups: data as PublicSidebarGroup[], blocks: [] };
  if (data && typeof data === 'object' && Array.isArray((data as PublicSidebarMenu).groups)) {
    const menu = data as PublicSidebarMenu;
    return { groups: menu.groups, blocks: Array.isArray(menu.blocks) ? menu.blocks : [] };
  }
  return null;
};

/**
 * GET /sidebar-menus, shared by every caller: one request in flight at a time
 * and one per 30s. `null` means "nothing from the API" (the caller draws the
 * built-in menu and blocks). A failed refetch keeps the last good answer
 * rather than dropping back to the built-in one.
 */
export const getPublicSidebarMenus = (): Promise<PublicSidebarMenu | null> => {
  if (cache && Date.now() - cache.at < SIDEBAR_CACHE_MS) {
    return Promise.resolve(cache.value);
  }
  if (inFlight) return inFlight;

  inFlight = apiService
    .get<unknown>('/sidebar-menus')
    .then((res) => {
      const value = res?.success ? normalise(res.data) : null;
      if (!value) throw new Error('No sidebar menu');
      cache = { at: Date.now(), value };
      return value;
    })
    .catch(() => {
      const value = cache?.value ?? null;
      // Wait out the window before asking again, keeping what we had.
      cache = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};
