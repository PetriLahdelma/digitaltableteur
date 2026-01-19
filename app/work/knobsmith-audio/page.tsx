import type { Metadata } from "next";

import { KnobSmithAudioPage } from "@dt-pages/Work/KnobSmithAudio";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "KnobSmith Audio Case Study | Digitaltableteur",
  description:
    "Designing frictionless UX for audio plugins, blending analog inspiration with modern interaction patterns.",
  openGraph: {
    title: "KnobSmith Audio Case Study | Digitaltableteur",
    description:
      "Designing frictionless UX for audio plugins, blending analog inspiration with modern interaction patterns.",
    type: "article",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/images/portfolio/knobsmith-audio/hero.png",
        width: 2400,
        height: 1260,
        alt: "KnobSmith Audio plugin landing visual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KnobSmith Audio Case Study | Digitaltableteur",
    description:
      "Designing frictionless UX for audio plugins, blending analog inspiration with modern interaction patterns.",
    images: ["/images/portfolio/knobsmith-audio/hero.png"],
  },
  alternates: {
    canonical: "/work/knobsmith-audio",
  },
};

export const revalidate = 3600;

export default function KnobSmithAudio() {
  return <KnobSmithAudioPage nav={<NextWorkNav />} />;
}
