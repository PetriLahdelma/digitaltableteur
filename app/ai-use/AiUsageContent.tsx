"use client";

import { useRouter } from "next/navigation";

import { AiUsagePage } from "@/shared/components/pages/AiUsagePage";

export function AiUsageContent() {
  const router = useRouter();
  return <AiUsagePage onBack={() => router.push("/")} />;
}
