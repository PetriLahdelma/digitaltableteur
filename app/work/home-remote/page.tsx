import type { Metadata } from "next";

import { HomeRemotePage } from "@dt-pages/Work/HomeRemote";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Home Remote Case Study | Digitaltableteur",
  description:
    "A native macOS remote for TVs, home AV and audio equipment: local-first control with a design system for a fun clay interface.",
  openGraph: {
    title: "Home Remote Case Study | Digitaltableteur",
    description:
      "A native macOS remote for TVs, home AV and audio equipment: local-first control with a design system for a fun clay interface.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Remote Case Study | Digitaltableteur",
    description:
      "A native macOS remote for TVs, home AV and audio equipment: local-first control with a design system for a fun clay interface.",
  },
  alternates: {
    canonical: "/work/home-remote",
  },
};

export const revalidate = 3600;

export default function HomeRemote() {
  return <HomeRemotePage nav={<NextWorkNav />} />;
}
