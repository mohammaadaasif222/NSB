import type { Metadata } from "next";
import { AuthPage } from "@/components/admin/auth-page";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login" };

/** Only allow redirects back into the admin panel. */
function safeNext(next: string | string[] | undefined): string {
  return typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;

  return (
    <AuthPage title="Admin Login" subtitle="Enter your details to access the dashboard">
      <LoginForm next={safeNext(next)} />
    </AuthPage>
  );
}
