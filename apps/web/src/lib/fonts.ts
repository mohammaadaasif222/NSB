import { Cormorant_Garamond, Manrope, Plus_Jakarta_Sans } from "next/font/google";

/** The site and admin font: one variable file covers every weight. */
export const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

/** The vendor page's phone layout (Makeup-Vendor-Page.html): serif headings over a sans body. */
export const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["500", "600", "700"] });
export const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
