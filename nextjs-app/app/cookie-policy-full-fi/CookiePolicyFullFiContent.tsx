"use client";

import { useRouter } from "next/navigation";

import { CookiePolicyFullFiPage } from "@dt-pages/CookiePolicy";

export function CookiePolicyFullFiContent() {
  const router = useRouter();
  return <CookiePolicyFullFiPage onBack={() => router.push("/")} />;
}
