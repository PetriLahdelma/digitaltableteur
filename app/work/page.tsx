import type { Metadata } from "next";

import { WorkIndexPage } from "@dt-pages/Work/WorkIndex";
import { projects } from "@/nextjs-app/shared/data/projects";

// Dynamic project list for structured data
const projectNames = projects.map((p) => p.title).join(", ");

export const metadata: Metadata = {
  title: "Work & Portfolio | Digitaltableteur",
  description: `Explore our portfolio of design systems, UX design, and creative projects. See case studies from ${projectNames}, and more.`,
  keywords: [
    "design systems",
    "UX design",
    "branding",
    "illustration",
    "portfolio",
    "Helsinki Design System",
    "UI components",
    "product design",
    "AI automation",
    "Digitaltableteur",
  ],
  openGraph: {
    title: "Work & Portfolio | Digitaltableteur",
    description: `Explore our portfolio of design systems, UX design, and creative projects. See case studies from ${projectNames}, and more.`,
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
    description: `Explore our portfolio of design systems, UX design, and creative projects. See case studies from ${projectNames}, and more.`,
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
