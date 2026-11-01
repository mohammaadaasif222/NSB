import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Noida Super Bazaar",
    default: "Wedding Vendors in Noida | Noida Super Bazaar",
  },
  description:
    "Find trusted wedding vendors in Noida, Greater Noida and Greater Noida West. Explore venues, photographers, caterers and more, then connect with the right team for your celebration.",
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
    <html lang="en-IN" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
