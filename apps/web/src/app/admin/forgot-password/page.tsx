import type { Metadata } from "next";
import { PASSWORD_RESET_MINUTES } from "@nsb/shared";
import { AuthPage } from "@/components/admin/auth-page";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthPage title="Forgot password?" subtitle="Enter your admin email and we will send you a reset link">
      <ForgotForm minutes={PASSWORD_RESET_MINUTES} />
    </AuthPage>
  );
}
