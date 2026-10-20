import { redirect } from "next/navigation";

/** Hero banners now live on the Home page screen. */
export default function BannersPage() {
  redirect("/admin/home#banners");
}
