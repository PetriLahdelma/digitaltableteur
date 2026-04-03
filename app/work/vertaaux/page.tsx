import type { Metadata } from "next";

import { VertaaUXPage } from "@dt-pages/Work/VertaaUX";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "VertaaUX Case Study | Digitaltableteur",
  description:
    "Building a real-time, predictive UX intelligence engine delivering one-click audits for usability, accessibility, and conversion.",
  openGraph: {
    title: "VertaaUX Case Study | Digitaltableteur",
    description:
      "Building a real-time, predictive UX intelligence engine delivering one-click audits for usability, accessibility, and conversion.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "VertaaUX Case Study | Digitaltableteur",
    description:
      "Building a real-time, predictive UX intelligence engine delivering one-click audits for usability, accessibility, and conversion.",
  },
  alternates: {
    canonical: "/work/vertaaux",
  },
};

export const revalidate = 3600;

export default function VertaaUX() {
  return <VertaaUXPage nav={<NextWorkNav />} />;
}
