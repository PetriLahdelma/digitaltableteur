import type { Metadata } from "next";

import { AiUsagePage } from "@dt-pages/AiUsagePage";

export const metadata: Metadata = {
  title: "AI Use & Transparency | Digitaltableteur",
  description:
    "Discover how Digitaltableteur uses AI-assisted tools responsibly, the safeguards we apply, and your rights under GDPR and EU law. Committed to ethical AI practices.",
  openGraph: {
    title: "AI Use & Transparency | Digitaltableteur",
    description:
      "Discover how Digitaltableteur uses AI-assisted tools responsibly, the safeguards we apply, and your rights under GDPR and EU law. Committed to ethical AI practices.",
    type: "website",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: "Digitaltableteur Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Use & Transparency | Digitaltableteur",
    description:
      "Discover how Digitaltableteur uses AI-assisted tools responsibly, the safeguards we apply, and your rights under GDPR and EU law. Committed to ethical AI practices.",
    images: ["/logo512.png"],
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
