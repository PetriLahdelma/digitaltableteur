import type { Metadata } from "next";

import { AiUsageContent } from "./AiUsageContent";

export const metadata: Metadata = {
  title: "AI use and transparency",
  description:
    "Read how Digitaltableteur uses AI-assisted tools, the safeguards we apply, and your rights under EU law.",
};

export default function AiUsePage() {
  return <AiUsageContent />;
}
