import Link from "next/link";
import type { ComponentProps } from "react";

export { Icon } from "@/components/shared/icon";

/** Site paths go through next/link, external links open in a new tab, "#" anchors stay plain. */
export function HomeLink({ href, ...props }: ComponentProps<"a"> & { href: string }) {
  if (href.startsWith("/")) return <Link href={href} {...props} />;
  const external = /^https?:\/\//.test(href);
  return <a href={href} {...props} {...(external && { target: "_blank", rel: "noopener noreferrer" })} />;
}
