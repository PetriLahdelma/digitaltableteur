import type { Metadata } from "next";
import Script from "next/script";

import { HomePage } from "@dt-pages/Home/HomePage";
import {
  getFaqSchema,
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

const homepageQuestions = [
  {
    question: "What does Digitaltableteur do?",
    answer:
      "Digitaltableteur is a design consultancy and portfolio focused on design systems, AI-powered design workflows, DesignOps, and product design for modern digital products.",
  },
  {
    question: "Who is this site for?",
    answer:
      "The site is for product leaders, design leaders, and teams that need a clearer design system, stronger component libraries, or better AI-assisted design workflows.",
  },
  {
    question: "What can I find on this site?",
    answer:
      "You can explore services, portfolio work, articles, accessibility guidance, and ways to contact Digitaltableteur for consulting or project work.",
  },
];

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
    getFaqSchema(homepageQuestions),
  ];

  return (
    <>
      <Script
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
