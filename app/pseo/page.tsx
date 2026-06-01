import type { Metadata } from "next";

import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";
import { PseoIndexPage } from "@dt-pages/Pseo/PseoIndexPage";

export const metadata: Metadata = {
  title: "Design System Playbooks | Digitaltableteur",
  description:
    "Practical design system and DesignOps playbooks by service, stack, and team context. Situation briefs, checklists, and case-study proof.",
  openGraph: {
    title: "Design System Playbooks | Digitaltableteur",
    description:
      "Practical design system and DesignOps playbooks by service, stack, and team context. Situation briefs, checklists, and case-study proof.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design System Playbooks | Digitaltableteur",
    description:
      "Practical design system and DesignOps playbooks by service, stack, and team context. Situation briefs, checklists, and case-study proof.",
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
