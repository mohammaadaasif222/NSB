import type { MetadataRoute } from "next";

/** Lets phones "Add to Home screen": the site then opens full-screen, like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Noida Super Bazaar",
    short_name: "NSB",
    description: "Find trusted wedding vendors in Noida, Greater Noida and Greater Noida West.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
