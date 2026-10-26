import Link from "next/link";

export function ComingSoon() {
  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="container-page">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0px_4px_8px_0px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-bold text-ink">Coming soon</h1>
          <p className="text-muted">
            We are onboarding trusted businesses in Noida, Greater Noida and Greater Noida West. This page will be live soon.
          </p>
          <Link
            href="/"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
