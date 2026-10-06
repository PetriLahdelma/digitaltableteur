import type { Metadata } from "next";

import { WorkIndexPage } from "@dt-pages/Work/WorkIndex";
import { isRoutableProject, projects } from "@/nextjs-app/shared/data/projects";
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";

// The case studies the index links to: coming-soon teasers have no page
// (a URL to them is a 404 for crawlers) and unlisted projects are off the grid.
const linkedProjects = projects.filter((p) => isRoutableProject(p) && !p.unlisted);
const projectNames = linkedProjects.map((p) => p.title).join(", ");

export const metadata: Metadata = {
  title: "Work & Portfolio | Digitaltableteur",
  description: `Explore a portfolio of design systems, UX design and creative projects. See case studies from ${projectNames}, and more.`,
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
    description: `Explore a portfolio of design systems, UX design and creative projects. See case studies from ${projectNames}, and more.`,
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work & Portfolio | Digitaltableteur",
    description: `Explore a portfolio of design systems, UX design and creative projects. See case studies from ${projectNames}, and more.`,
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
      items: linkedProjects.map((project) => ({
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
      <script
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
