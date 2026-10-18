import type { Metadata } from "next";

import { AboutPage } from "@dt-pages/AboutPage";
import {
  getBreadcrumbSchema,
  getWebPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";

export async function generateMetadata(): Promise<Metadata> {
  // The studio, not a person: the author page carries the personal bio.
  const title = "About the studio | Digitaltableteur";
  const description =
    "Digitaltableteur is a Helsinki design systems and AI-powered DesignOps studio: senior hands-on delivery, fixed-scope engagements and evidence over promises.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
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
      name: "About the studio | Digitaltableteur",
      description:
        "Digitaltableteur is a Helsinki design systems and AI-powered DesignOps studio: senior hands-on delivery, fixed-scope engagements and evidence over promises.",
      url: "/about",
      keywords: [
        "design systems studio",
        "AI-powered DesignOps",
        "design system consultancy",
        "Helsinki design studio",
      ],
    }),
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
