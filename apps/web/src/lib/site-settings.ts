import { DEFAULT_FOOTER, DEFAULT_HOME_CARDS, type SiteSettings } from "@nsb/shared";
import { api } from "@/lib/api";

/** Public site settings. A failure only hides optional extras (the WhatsApp button, the project page ad) and shows the default footer, never breaks the page. */
export function getSiteSettings(): Promise<SiteSettings> {
  return api
    .get<SiteSettings>("/site-settings")
    .catch(() => ({
      whatsapp: null,
      listingSidebar: { enabled: true, budget: true, type: true },
      projectSideAd: null,
      homeCards: DEFAULT_HOME_CARDS,
      footer: DEFAULT_FOOTER,
      eliteBanners: {},
    }));
}

/** wa.me chat link to the NSB number, with the admin's message; {listing} becomes the vendor's name. */
export function whatsappHref(whatsapp: NonNullable<SiteSettings["whatsapp"]>, listingName?: string) {
  const text = listingName ? whatsapp.message.replaceAll("{listing}", listingName) : "Hi Noida Super Bazaar, I would like some help finding a vendor.";
  return `https://wa.me/91${whatsapp.number}?text=${encodeURIComponent(text)}`;
}
