import "./admin-theme.css";

/** Wraps everything under /admin, sign-in included, so the public site never loads the admin's styles. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
