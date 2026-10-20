/**
 * "Venues by budget" / "Venues by type" side panels on the category listing page, styled after
 * WedMeGood. Static design content for now: the tiles do not filter yet (filters are Phase-2).
 * Photos are Unsplash placeholders, like the demo vendors; swap in NSB photos before launch.
 */

export interface BrowseTile {
  label: string;
  image: string;
}

export interface BrowsePanel {
  /** Which Admin › Settings switch controls it. */
  kind: "budget" | "type";
  title: string;
  tiles: BrowseTile[];
}

const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=160&h=160&q=70&auto=format&fit=crop`;

const budget = (noun: string, ids: [string, string, string, string]): BrowsePanel => ({
  kind: "budget",
  title: `${noun} by budget`,
  tiles: [
    { label: "Budget Friendly", image: photo(ids[0]) },
    { label: "Value For Money", image: photo(ids[1]) },
    { label: "Premium", image: photo(ids[2]) },
    { label: "Luxury", image: photo(ids[3]) },
  ],
});

const panel = (title: string, tiles: Array<[string, string]>): BrowsePanel => ({
  kind: "type",
  title,
  tiles: tiles.map(([label, id]) => ({ label, image: photo(id) })),
});

const PANELS: Record<string, BrowsePanel[]> = {
  "wedding-venues": [
    budget("Venues", ["1542665952-14513db15293", "1524824267900-2fa9cbf7a506", "1526568929-7cdd510e77fd", "1549895058-36748fa6c6a7"]),
    panel("Venues by type", [
      ["Banquet Halls", "1587271407850-8d438ca9fdf2"],
      ["Hotels", "1666617710768-425d2d9088f8"],
      ["Lawns & Farmhouses", "1677129663241-5be1f17fe6fe"],
      ["Resorts", "1761114905078-163aa92141c8"],
    ]),
  ],
  "makeup-beauty": [
    budget("Makeup artists", ["1684868268327-7e5590bcfbd6", "1610047614301-13c63f00c032", "1610173827043-9db50e0d8ef9", "1684868265714-fd2300637c23"]),
    panel("Makeup by service", [
      ["Bridal Makeup", "1600685890506-593fdf55949b"],
      ["Engagement", "1684868682581-4cac3af5b8d4"],
      ["Party Makeup", "1617633150878-7df1d12a9a57"],
      ["Mehendi", "1677691257363-eebd2abeafec"],
    ]),
  ],
  "catering-halwai": [
    budget("Caterers", ["1742281257687-092746ad6021", "1555244162-803834f70033", "1576842546422-60562b9242ae", "1742281258189-3b933879867a"]),
    panel("Catering by cuisine", [
      ["North Indian", "1564638305579-5e395c9b62c7"],
      ["South Indian", "1616668856493-9df876327739"],
      ["Chinese", "1742281257707-0c7f7e5ca9c6"],
      ["Live Counters", "1724218012292-5548214cc2d2"],
    ]),
  ],
  "photography-films": [
    budget("Photographers", ["1630526720753-aa4e71acf67d", "1629756048377-09540f52caa1", "1519741497674-611481863552", "1519741196428-6a2175fa2557"]),
    panel("Photography by style", [
      ["Candid", "1611550287705-7ff8b459c8eb"],
      ["Traditional", "1600164913117-2125c1f60b01"],
      ["Cinematic Films", "1722805740177-04256b6517f2"],
      ["Pre-wedding", "1503525443530-339273ca8a86"],
    ]),
  ],
  "cards-invitations": [
    budget("Cards", ["1632610992723-82d7c212f6d7", "1741893043659-ca8b82a8b637", "1732649124686-3bab54f79aa3", "1738898179451-b5fc497f9f8e"]),
    panel("Cards by type", [
      ["Printed Cards", "1509316554658-04f9287cdb78"],
      ["E-invites", "1721176487015-5408ae0e9bc2"],
      ["Video Invites", "1632610992723-82d7c212f6d7"],
      ["Gift Hampers", "1741893043659-ca8b82a8b637"],
    ]),
  ],
};

/** Panels for a sub-category; other categories get a budget panel with neutral photos. */
export function browsePanels(categorySlug: string, categoryName: string): BrowsePanel[] {
  return PANELS[categorySlug] ?? [budget(categoryName, ["1542665952-14513db15293", "1524824267900-2fa9cbf7a506", "1526568929-7cdd510e77fd", "1549895058-36748fa6c6a7"])];
}
