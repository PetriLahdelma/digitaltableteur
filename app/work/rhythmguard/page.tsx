import type { Metadata } from "next";

import { RhythmguardPage } from "@dt-pages/Work/Rhythmguard";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Rhythmguard: Design Token Enforcement | Digitaltableteur",
  description:
    "A Stylelint plugin that enforces design token usage at lint time. Catches hardcoded values and autofixes them to token references.",
  openGraph: {
    title: "Rhythmguard: Design Token Enforcement | Digitaltableteur",
    description:
      "A Stylelint plugin that enforces design token usage at lint time. Catches hardcoded values and autofixes them to token references.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rhythmguard: Design Token Enforcement | Digitaltableteur",
    description:
      "A Stylelint plugin that enforces design token usage at lint time. Catches hardcoded values and autofixes them to token references.",
  },
  alternates: {
    canonical: "/work/rhythmguard",
  },
};

export const revalidate = 3600;

export default function Rhythmguard() {
  return <RhythmguardPage nav={<NextWorkNav />} />;
}
