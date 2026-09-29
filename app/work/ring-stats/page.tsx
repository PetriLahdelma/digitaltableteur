import type { Metadata } from "next";

import { RingStatsPage } from "@dt-pages/Work/RingStats";
import { NextWorkNav } from "../NextWorkNav";

const description =
  "A calm macOS menu-bar glance at today's ring scores and battery: private by default, honest about freshness.";

export const metadata: Metadata = {
  title: "Ring Stats Case Study | Digitaltableteur",
  description,
  openGraph: {
    title: "Ring Stats Case Study | Digitaltableteur",
    description,
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ring Stats Case Study | Digitaltableteur",
    description,
  },
  alternates: {
    canonical: "/work/ring-stats",
  },
};

export const revalidate = 3600;

export default function RingStats() {
  return <RingStatsPage nav={<NextWorkNav />} />;
}
