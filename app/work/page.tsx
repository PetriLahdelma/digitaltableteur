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
  },
  twitter: {
    card: "summary_large_image",
    title: "Work & Portfolio | Digitaltableteur",
    description:
      "Portfolio of design systems, UI components, and product design work. Explore case studies showcasing scalable design solutions and AI-powered automation projects from Digitaltableteur.",
  },
  alternates: {
    canonical: "/work",
  },
};

export const revalidate = 3600;

export default function Work() {
  return <WorkIndexPage />;
}
