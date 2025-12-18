"use client";

import { useRouter } from "next/navigation";

import { CookiePolicyFullEnPage } from "@dt-pages/CookiePolicy";

export function CookiePolicyFullEnContent() {
  const router = useRouter();
  return <CookiePolicyFullEnPage onBack={() => router.push("/")} />;
}
