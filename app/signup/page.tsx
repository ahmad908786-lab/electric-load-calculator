import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <Suspense>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
