import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });

/** Google Tag Manager container for the site (set up by the client). */
const GTM_ID = "GTM-M5RVF7KB";

export const metadata: Metadata = {
  title: {
    template: "%s | Noida Super Bazaar",
    default: "Wedding Vendors in Noida | Noida Super Bazaar",
  },
  description:
    "Find trusted wedding vendors in Noida, Greater Noida and Noida Extension. Explore venues, photographers, caterers and more, then connect with the right team for your celebration.",
  // Opened from the home screen, iOS shows the site full-screen with a white status bar.
  appleWebApp: { capable: true, title: "NSB", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

/** `viewport-fit=cover` lets the bottom bars sit clear of the iPhone home indicator (safe-area insets). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        {/* Google Tag Manager: the standard snippet, loaded once the page is interactive. */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
