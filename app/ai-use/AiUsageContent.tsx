"use client";

import { useRouter } from "next/navigation";

import { AiUsagePage } from "@/nextjs-app/shared/components/pages/AiUsagePage";

export function AiUsageContent() {
  const router = useRouter();
  return <AiUsagePage onBack={() => router.push("/")} />;
}
