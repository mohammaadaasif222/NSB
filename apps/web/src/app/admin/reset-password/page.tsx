import type { Metadata } from "next";
import Link from "next/link";
import { authLinkClass, AuthPage } from "@/components/admin/auth-page";
import { ResetForm } from "./reset-form";

// The address carries the reset token, so it must not reach other sites as a referrer.
export const metadata: Metadata = { title: "Reset password", referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const { token } = await searchParams;

  if (typeof token !== "string" || !token) {
    return (
      <AuthPage title="Reset password" subtitle="This reset link is incomplete. Open it from your email again, or ask for a new one.">
        <p className="text-center">
          <Link href="/admin/forgot-password" className={authLinkClass}>
            Request a new link
          </Link>
        </p>
      </AuthPage>
    );
  }

  return (
    <AuthPage title="Reset password" subtitle="Choose a new password for your admin account">
      <ResetForm token={token} />
    </AuthPage>
  );
}
