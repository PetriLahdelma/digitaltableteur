"use client";

import { useRouter } from "next/navigation";

import { CookiePolicyFullFiPage } from "@/shared/components/pages/CookiePolicy";

export function CookiePolicyFullFiContent() {
  const router = useRouter();
  return <CookiePolicyFullFiPage onBack={() => router.push("/")} />;
}
