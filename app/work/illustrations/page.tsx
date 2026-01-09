import type { Metadata } from "next";

import { IllustrationsPage } from "@dt-pages/Work/Illustrations";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Illustrations Portfolio | Digitaltableteur",
  description:
    "Diverse illustration work spanning traditional pencil drawings, watercolor paintings, vector graphics, and pixel art. Creative exploration across multiple mediums and styles.",
  openGraph: {
    title: "Illustrations Portfolio | Digitaltableteur",
    description:
      "Diverse illustration work spanning traditional pencil drawings, watercolor paintings, vector graphics, and pixel art. Creative exploration across multiple mediums and styles.",
    type: "article",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: "Digitaltableteur Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Illustrations Portfolio | Digitaltableteur",
    description:
      "Diverse illustration work spanning traditional pencil drawings, watercolor paintings, vector graphics, and pixel art. Creative exploration across multiple mediums and styles.",
    images: ["/logo512.png"],
  },
  alternates: {
    canonical: "/work/illustrations",
  },
};

export const revalidate = 3600;

export default function Illustrations() {
  return <IllustrationsPage nav={<NextWorkNav />} />;
}
