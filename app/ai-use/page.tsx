import type { Metadata } from "next";

import { AiUsagePage } from "@dt-pages/AiUsagePage";

export const metadata: Metadata = {
  title: "AI Use & Transparency | Digitaltableteur",
  description:
    "How Digitaltableteur uses AI-assisted tools in client work, the safeguards applied and your rights under GDPR and EU law, explained in plain language.",
  openGraph: {
    title: "AI Use & Transparency | Digitaltableteur",
    description:
      "How Digitaltableteur uses AI-assisted tools in client work, the safeguards applied and your rights under GDPR and EU law, explained in plain language.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Use & Transparency | Digitaltableteur",
    description:
      "How Digitaltableteur uses AI-assisted tools in client work, the safeguards applied and your rights under GDPR and EU law, explained in plain language.",
  },
  alternates: {
    canonical: "/ai-use",
  },
};

// Cache this marketing page for an hour
export const revalidate = 3600;

export default function AiUse() {
  return <AiUsagePage />;
}
