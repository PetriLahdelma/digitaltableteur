import type { Metadata } from "next";

import { RawViewPage } from "@dt-pages/Work/RawView";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Raw View Case Study | Digitaltableteur",
  description:
    "Relaunching Photo Raw as Raw View, a 160-page bilingual bookazine and e-magazine for documentary photography.",
  openGraph: {
    title: "Raw View Case Study | Digitaltableteur",
    description:
      "Relaunching Photo Raw as Raw View, a 160-page bilingual bookazine and e-magazine for documentary photography.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Raw View Case Study | Digitaltableteur",
    description:
      "Relaunching Photo Raw as Raw View, a 160-page bilingual bookazine and e-magazine for documentary photography.",
  },
  alternates: {
    canonical: "/work/raw-view",
  },
};

export const revalidate = 3600;

export default function RawView() {
  return <RawViewPage nav={<NextWorkNav />} />;
}
