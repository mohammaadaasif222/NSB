import { ComingSoon } from "@/components/site/coming-soon";
import { CATEGORY_PAGES_ENABLED } from "@/lib/flags";

/** Gate for every category route; see CATEGORY_PAGES_ENABLED. */
export default function VerticalLayout({ children }: LayoutProps<"/[vertical]">) {
  return CATEGORY_PAGES_ENABLED ? children : <ComingSoon />;
}
