import { redirect } from "next/navigation";

/** Categories ("Browse by category") now live on the Home page screen. */
export default function CategoriesPage() {
  redirect("/admin/home#categories");
}
