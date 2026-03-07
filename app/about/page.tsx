import type { Metadata } from "next";

import { AboutPage } from "@dt-pages/AboutPage";
import { getPersonSchema, stringifyJsonLd } from "@/app/lib/structuredData";

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
      images: [
        {
          url: "/logo512.png",
          width: 512,
          height: 512,
          alt: "Digitaltableteur Logo",
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo512.png"],
    },
    alternates: {
      canonical: "/about",
    },
  };
}

export const revalidate = 3600;

export default function About() {
  return (
    <>
      <script
        id="schema-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(getPersonSchema()),
        }}
      />
      <AboutPage />
    </>
  );
}
