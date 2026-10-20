import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="text-2xl font-bold text-ink">Page not found</h1>
      <p className="text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">
        Go to home
      </Link>
    </main>
  );
}
