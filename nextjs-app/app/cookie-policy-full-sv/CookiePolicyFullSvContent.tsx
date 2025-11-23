"use client";

import { useRouter } from "next/navigation";

import { CookiePolicyFullSvPage } from "../../shared/components/pages/CookiePolicy";

export function CookiePolicyFullSvContent() {
  const router = useRouter();
  return <CookiePolicyFullSvPage onBack={() => router.push("/")} />;
}
