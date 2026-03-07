import type { Metadata } from "next";
import Script from "next/script";

import { WorkIndexPage } from "@dt-pages/Work/WorkIndex";
import { projects } from "@/nextjs-app/shared/data/projects";
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";

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
  const structuredData = [
    getCollectionPageSchema({
      name: "Digitaltableteur Work & Portfolio",
      description:
        "Portfolio examples across design systems, branding, illustration, and AI-powered product design work.",
      url: "/work",
      keywords: [
        "design systems portfolio",
        "AI-powered design portfolio",
        "branding work",
        "product design case studies",
      ],
      items: projects.map((project) => ({
        name: project.title,
        url: `/work/${project.slug}`,
        description: project.description,
      })),
    }),
    getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Work", url: "/work" },
    ]),
  ];

  return (
    <>
      <Script
        id="schema-work"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <WorkIndexPage />
    </>
  );
}
