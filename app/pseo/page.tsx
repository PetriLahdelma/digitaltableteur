import type { Metadata } from "next";

import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";
import { PseoIndexPage } from "@dt-pages/Pseo/PseoIndexPage";

export const metadata: Metadata = {
  title: "Design System Guides | Digitaltableteur",
  description:
    "Comprehensive library of design system and DesignOps guides. Structured content covering services, technology stacks, and audience-specific implementation strategies.",
  openGraph: {
    title: "Design System Guides | Digitaltableteur",
    description:
      "Comprehensive library of design system and DesignOps guides. Structured content covering services, technology stacks, and audience-specific implementation strategies.",
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
    title: "Design System Guides | Digitaltableteur",
    description:
      "Comprehensive library of design system and DesignOps guides. Structured content covering services, technology stacks, and audience-specific implementation strategies.",
    images: ["/logo512.png"],
  },
  alternates: {
    canonical: "/pseo",
  },
};

export const revalidate = 3600;

export default function PseoIndexRoute() {
  const catalog = getPseoCatalog();
  const leafPages = getPseoLeafPages();
  const samplePages = leafPages.slice(0, 12);

  return <PseoIndexPage catalog={catalog} samplePages={samplePages} />;
}
