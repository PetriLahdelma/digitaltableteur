import type { Metadata } from "next";

import { AboutPage } from "@dt-pages/AboutPage";
import { aboutFaqs } from "@/app/lib/aeoContent";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  getPersonSchema,
  getWebPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";

export async function generateMetadata(): Promise<Metadata> {
  const title = "About Petri Lahdelma | Digitaltableteur";
  const description =
    "Meet Petri Lahdelma, Design Systems Specialist and DesignOps Engineer. Expert in React, TypeScript, Figma, and AI-powered design workflows. Based in Finland, working globally.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: "/about",
    },
  };
}

export const revalidate = 3600;

export default function About() {
  const structuredData = [
    getWebPageSchema({
      name: "About Petri Lahdelma | Digitaltableteur",
      description:
        "Design Systems Specialist and DesignOps Engineer. Expert in React, TypeScript, Figma, and AI-powered design workflows.",
      url: "/about",
      keywords: [
        "Petri Lahdelma",
        "design systems specialist",
        "DesignOps engineer",
        "Helsinki design consultant",
      ],
    }),
    getPersonSchema(),
    getFaqSchema(aboutFaqs),
    getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "About", url: "/about" },
    ]),
  ];

  return (
    <>
      <script
        id="schema-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <AboutPage />
    </>
  );
}
