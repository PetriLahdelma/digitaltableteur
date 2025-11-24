"use client";

import { useRouter } from "next/navigation";

import { CookiePolicyFullEnPage } from "@/shared/components/pages/CookiePolicy";

export function CookiePolicyFullEnContent() {
  const router = useRouter();
  return <CookiePolicyFullEnPage onBack={() => router.push("/")} />;
}
