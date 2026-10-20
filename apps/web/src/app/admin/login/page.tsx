import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login" };

/** The login design's typeface; scoped to this page, the panel keeps Inter. */
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

/** Only allow redirects back into the admin panel. */
function safeNext(next: string | string[] | undefined): string {
  return typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

/**
 * Admin login, built from the client's "Admin Login | Noida Super Bazaar" design: logo bar with
 * a link back to the site, a centred card over a faded cityscape, and the Delhi Infomedia credit
 * pill at the bottom.
 */
export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;

  return (
    <div
      className={`${jakarta.className} login-stage relative flex h-dvh flex-col overflow-hidden [@media(max-height:560px)]:h-auto [@media(max-height:560px)]:min-h-dvh text-[#0F172A] antialiased [background:radial-gradient(900px_480px_at_50%_-10%,#EEF0FF,transparent_70%),linear-gradient(180deg,#F5F6FA_0%,#E9ECFB_100%)]`}
    >
      {/* Dotted grid that fades out towards the middle of the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(#E2E5EE_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(180deg,#000,transparent_65%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-[18px] pt-[calc(18px+env(safe-area-inset-top,0px))] sm:px-8">
        <Link href="/" className="animate-rise block" aria-label="Noida Super Bazaar">
          <Image src="/images/admin/login-logo.png" alt="Noida Super Bazaar" width={260} height={131} priority className="h-[46px] w-auto sm:h-14 [@media(max-height:700px)]:h-[46px]!" />
        </Link>
        <Link href="/" className="animate-rise text-[13px] font-semibold text-[#64748B] [animation-delay:160ms] hover:text-[#1700D6]">
          ← Back to website
        </Link>
      </header>

      {/* Cityscape behind the card, faded in from the top. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(60vh,580px)] opacity-50">
        <Image
          src="/images/admin/login-scene.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_62%] [mask-image:linear-gradient(180deg,transparent_0%,#000_42%)]"
        />
      </div>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-5 pt-3 pb-24">
        <section
          aria-labelledby="login-title"
          className="animate-rise w-full max-w-[420px] rounded-[18px] border border-[#E2E5EE] bg-white px-5 pt-[26px] pb-[22px] shadow-[0_40px_80px_-40px_rgba(23,0,214,0.35),0_6px_20px_-8px_rgba(15,23,42,0.12)] [animation-delay:80ms] sm:rounded-[22px] sm:px-8 sm:pt-[34px] sm:pb-7 [@media(max-height:700px)]:px-7! [@media(max-height:700px)]:pt-6! [@media(max-height:700px)]:pb-5!"
        >
          <h1 id="login-title" className="text-2xl font-extrabold tracking-[-0.02em]">
            Admin Login
          </h1>
          <p className="mt-1.5 mb-6 [@media(max-height:700px)]:mb-4 text-sm text-[#64748B]">Enter your details to access the dashboard</p>
          <LoginForm next={safeNext(next)} />
          <div className="mt-[18px] flex [@media(max-height:700px)]:hidden items-center justify-center gap-[7px] border-t border-[#E2E5EE] pt-4 text-xs text-[#64748B]">
            <ShieldCheck className="size-3.5" strokeWidth={1.8} aria-hidden />
            Restricted area. Authorised admin only.
          </div>
        </section>
      </main>

      <div className="animate-rise absolute inset-x-4 bottom-[calc(18px+env(safe-area-inset-bottom,0px))] z-10 mx-auto flex w-fit max-w-full items-center gap-2.5 rounded-[18px] border border-white/20 bg-[#0B0A33] px-4 py-2.5 text-center text-xs font-medium text-[#dfe2fb] shadow-[0_14px_34px_-10px_rgba(11,10,51,0.7)] [animation-delay:200ms] sm:rounded-full sm:px-[22px] sm:text-[13px] sm:whitespace-nowrap">
        <i className="size-2 shrink-0 rounded-full bg-[#DF0709]" aria-hidden />
        <span>
          A venture by <b className="font-extrabold text-white">Delhi Infomedia Private Limited</b>
        </span>
      </div>
    </div>
  );
}
