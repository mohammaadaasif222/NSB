import { Plus_Jakarta_Sans, Poppins } from "next/font/google";

/** The site and admin font: one variable file covers every weight. */
export const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });

/** Headings of the project page's phone layout (real-esatate-details-page-mobile.html); its text is Inter. */
export const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
