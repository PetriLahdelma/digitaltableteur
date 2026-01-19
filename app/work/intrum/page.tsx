import type { Metadata } from "next";

import { IntrumPage } from "@dt-pages/Work/Intrum";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Intrum Case Study | Digitaltableteur",
  description:
    "Research-led UX redesign for Intrum Justitia operations, aligning debt collection tools, processes, and teams.",
  openGraph: {
    title: "Intrum Case Study | Digitaltableteur",
    description:
      "Research-led UX redesign for Intrum Justitia operations, aligning debt collection tools, processes, and teams.",
    type: "article",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/images/portfolio/intrum/hero.png",
        width: 1440,
        height: 1024,
        alt: "Intrum operations UI concept",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Intrum Case Study | Digitaltableteur",
    description:
      "Research-led UX redesign for Intrum Justitia operations, aligning debt collection tools, processes, and teams.",
    images: ["/images/portfolio/intrum/hero.png"],
  },
  alternates: {
    canonical: "/work/intrum",
  },
};

export const revalidate = 3600;

export default function Intrum() {
  return <IntrumPage nav={<NextWorkNav />} />;
}
