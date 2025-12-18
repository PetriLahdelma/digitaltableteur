import type { Metadata } from "next";

import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";
import { PseoIndexPage } from "@dt-pages/Pseo/PseoIndexPage";

export const metadata: Metadata = {
  title: "Programmatic Guides | Digitaltableteur",
  description:
    "A programmatic library of design system and DesignOps guides with clear structure and internal linking.",
};

export default function PseoIndexRoute() {
  const catalog = getPseoCatalog();
  const leafPages = getPseoLeafPages();
  const samplePages = leafPages.slice(0, 12);

  return <PseoIndexPage catalog={catalog} samplePages={samplePages} />;
}
