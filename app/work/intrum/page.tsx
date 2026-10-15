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
  },
  twitter: {
    card: "summary_large_image",
    title: "Intrum Case Study | Digitaltableteur",
    description:
      "Research-led UX redesign for Intrum Justitia operations, aligning debt collection tools, processes, and teams.",
  },
  alternates: {
    canonical: "/work/intrum",
  },
  // Work in progress: reachable by URL, not indexed or listed.
  robots: { index: false, follow: true },
};

export const revalidate = 3600;

export default function Intrum() {
  return <IntrumPage nav={<NextWorkNav />} />;
}
