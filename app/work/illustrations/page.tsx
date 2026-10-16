import type { Metadata } from "next";

import { IllustrationsPage } from "@dt-pages/Work/Illustrations";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Illustrations Portfolio | Digitaltableteur",
  description:
    "Illustration work across pencil drawings, watercolor paintings, vector graphics and pixel art: creative exploration in many mediums and styles.",
  openGraph: {
    title: "Illustrations Portfolio | Digitaltableteur",
    description:
      "Illustration work across pencil drawings, watercolor paintings, vector graphics and pixel art: creative exploration in many mediums and styles.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Illustrations Portfolio | Digitaltableteur",
    description:
      "Illustration work across pencil drawings, watercolor paintings, vector graphics and pixel art: creative exploration in many mediums and styles.",
  },
  alternates: {
    canonical: "/work/illustrations",
  },
};

export const revalidate = 3600;

export default function Illustrations() {
  return <IllustrationsPage nav={<NextWorkNav />} />;
}
