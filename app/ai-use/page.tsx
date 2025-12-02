import type { Metadata } from "next";

import { AiUsagePage } from "@/nextjs-app/shared/components/pages/AiUsagePage";

export const metadata: Metadata = {
  title: "AI use and transparency",
  description:
    "Read how Digitaltableteur uses AI-assisted tools, the safeguards we apply, and your rights under EU law.",
};

// Cache this marketing page for an hour
export const revalidate = 3600;

export default function AiUse() {
  return <AiUsagePage />;
}
