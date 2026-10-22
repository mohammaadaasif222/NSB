import Link from "next/link";
import type { ComponentProps } from "react";

/** A 24×24 line icon drawn from one path, as in the demo. `fill` draws it solid instead. */
export function Icon({ d, size = 20, stroke = 1.7, fill }: { d: string; size?: number; stroke?: number; fill?: string }) {
  return fill ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} aria-hidden>
      <path d={d} />
    </svg>
  ) : (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

/** Site paths go through next/link, external links open in a new tab, "#" anchors stay plain. */
export function HomeLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  const external = /^https?:\/\//.test(href);
  return <a href={href} {...props} {...(external && { target: "_blank", rel: "noopener noreferrer" })} />;
}
