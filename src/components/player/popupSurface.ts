/**
 * The header popups' glass, as the designs read over the dark page —
 * measured off their renders rather than rebuilt from Figma's layered glass.
 *
 * Opaque on purpose: the popups open inside the bar, which has its own
 * backdrop blur, and a second blur nested in it cannot reach the page behind,
 * so any translucency shows that page unblurred. The rim is an inset ring, so
 * it adds nothing to the designs' sizes.
 *
 * `raised` — the account menu and the rewards tray (#252627).
 * `deep` — the notification centre, darker over its dimmed backdrop.
 */
export const POPUP_SURFACE = {
  raised: 'bg-[#252627] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.12)]',
  deep: 'bg-[#17181b] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.12)]',
} as const;

export type PopupTone = keyof typeof POPUP_SURFACE;
