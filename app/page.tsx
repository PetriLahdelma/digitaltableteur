import type { Metadata } from "next";

import { HomePage } from "@dt-pages/Home/HomePage";
import {
  getItemListSchema,
  getWebPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";

export const metadata: Metadata = {
  title: "Digitaltableteur | Design Systems & AI-Powered DesignOps",
  description:
    "Design systems, AI-native workflows, and scalable DesignOps. Component libraries, design tokens, and intelligent automation for modern product teams.",
  openGraph: {
    title: "Digitaltableteur | Design Systems & AI-Powered DesignOps",
    description:
      "Design systems, AI-native workflows, and scalable DesignOps. Component libraries, design tokens, and intelligent automation for modern product teams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Digitaltableteur | Design Systems & AI-Powered DesignOps",
    description:
      "Design systems, AI-native workflows, and scalable DesignOps. Component libraries, design tokens, and intelligent automation for modern product teams.",
  },
  alternates: {
    canonical: "/",
  },
};

export const revalidate = 3600;

const homepagePaths = [
  {
    name: "Services and capabilities",
    url: "/#services",
    description:
      "Overview of design systems, AI-powered design, branding, UX, and creative development services.",
  },
  {
    name: "Selected work and case studies",
    url: "/work",
    description:
      "Selected work across design systems, product design, branding, and accessibility-focused delivery.",
  },
  {
    name: "Blog and insights",
    url: "/blog",
    description:
      "Articles about design systems, AI-native workflows, accessibility, and product design practice.",
  },
  {
    name: "Contact",
    url: "/contact",
    description:
      "Direct route for consulting enquiries, design system work, and collaboration requests.",
  },
];

export default function Home() {
  const structuredData = [
    getWebPageSchema({
      name: "Digitaltableteur | Design Systems & AI-Powered DesignOps",
      description:
        "Design consultancy and portfolio for design systems, AI-powered design workflows, DesignOps, and product craft.",
      url: "/",
      keywords: [
        "design consultancy",
        "design systems",
        "AI-powered design",
        "DesignOps",
        "portfolio",
      ],
    }),
    getItemListSchema({
      name: "Primary Digitaltableteur paths",
      items: homepagePaths,
    }),
  ];

  return (
    <>
      <script
        id="schema-home"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <HomePage />
    </>
  );
}
