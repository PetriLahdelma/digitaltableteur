import type { Metadata } from "next";

import { HomeRemotePage } from "@dt-pages/Work/HomeRemote";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Home Remote Case Study | Digitaltableteur",
  description:
    "A native macOS remote for TVs and AV displays: local-first control with a tactile clay interface that reports what it observes, not what it hopes.",
  openGraph: {
    title: "Home Remote Case Study | Digitaltableteur",
    description:
      "A native macOS remote for TVs and AV displays: local-first control with a tactile clay interface that reports what it observes, not what it hopes.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Remote Case Study | Digitaltableteur",
    description:
      "A native macOS remote for TVs and AV displays: local-first control with a tactile clay interface that reports what it observes, not what it hopes.",
  },
  alternates: {
    canonical: "/work/home-remote",
  },
};

export const revalidate = 3600;

export default function HomeRemote() {
  return <HomeRemotePage nav={<NextWorkNav />} />;
}
