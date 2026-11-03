import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Içeri girmek", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="wrap py-10 sm:py-16">
      <Suspense fallback={<div className="mx-auto h-96 max-w-md animate-pulse rounded-2xl bg-card" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
