/** Hue from a name, so each initials tile keeps its color. */
export function hueOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** Square tile: the cover photo when there is one, else colored initials (as in the demo admin). */
export function ListingThumb({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  return (
    <span
      className="a-th"
      aria-hidden
      style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : { background: `hsl(${hueOf(name)} 55% 45%)` }}
    >
      {imageUrl ? null : initialsOf(name)}
    </span>
  );
}
