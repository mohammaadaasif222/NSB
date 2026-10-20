import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Noida Super Bazaar",
    default: "Wedding Vendors in Noida | Noida Super Bazaar",
  },
  description:
    "Find trusted wedding vendors in Noida, Greater Noida and Noida Extension. Explore venues, photographers, caterers and more, then connect with the right team for your celebration.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
