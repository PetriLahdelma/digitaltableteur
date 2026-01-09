import type { Metadata } from "next";

import { WorkIndexPage } from "@dt-pages/Work/WorkIndex";

export const metadata: Metadata = {
  title: "Work & Portfolio | Digitaltableteur",
  description:
    "Portfolio of design systems, UI components, and product design work. Explore case studies showcasing scalable design solutions and AI-powered automation projects from Digitaltableteur.",
  openGraph: {
    title: "Work & Portfolio | Digitaltableteur",
    description:
      "Portfolio of design systems, UI components, and product design work. Explore case studies showcasing scalable design solutions and AI-powered automation projects from Digitaltableteur.",
    type: "website",
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
    title: "Work & Portfolio | Digitaltableteur",
    description:
      "Portfolio of design systems, UI components, and product design work. Explore case studies showcasing scalable design solutions and AI-powered automation projects from Digitaltableteur.",
    images: ["/logo512.png"],
  },
  alternates: {
    canonical: "/work",
  },
};

export const revalidate = 3600;

export default function Work() {
  return <WorkIndexPage />;
}
