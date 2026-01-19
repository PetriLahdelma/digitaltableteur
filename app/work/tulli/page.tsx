import type { Metadata } from "next";

import { TulliPage } from "@dt-pages/Work/Tulli";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Tulli Case Study | Digitaltableteur",
  description:
    "NettiAsiointiKanava phase 1 for Finnish Customs, enabling Intrastat reporting and enterprise self-service.",
  openGraph: {
    title: "Tulli Case Study | Digitaltableteur",
    description:
      "NettiAsiointiKanava phase 1 for Finnish Customs, enabling Intrastat reporting and enterprise self-service.",
    type: "article",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/images/portfolio/tulli/hero.png",
        width: 1600,
        height: 840,
        alt: "Tulli Intrastat service overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tulli Case Study | Digitaltableteur",
    description:
      "NettiAsiointiKanava phase 1 for Finnish Customs, enabling Intrastat reporting and enterprise self-service.",
    images: ["/images/portfolio/tulli/hero.png"],
  },
  alternates: {
    canonical: "/work/tulli",
  },
};

export const revalidate = 3600;

export default function Tulli() {
  return <TulliPage nav={<NextWorkNav />} />;
}
