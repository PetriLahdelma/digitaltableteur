import type { Metadata } from "next";
import Link from "next/link";
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
    name: "Selected portfolio work",
    url: "/work",
    description:
      "Portfolio examples across design systems, product design, branding, and accessibility-focused work.",
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
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8">
        <div className="grid gap-6 rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] md:p-8 dark:border-white/10 dark:bg-neutral-950/60">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/55 dark:text-white/55">
              Site Purpose
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
              Clear entry points for design systems, AI-powered design, and
              portfolio proof.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-black/70 dark:text-white/70">
              This site is structured so both people and language models can
              quickly understand what Digitaltableteur offers, where the proof
              lives, and how to start a conversation.
            </p>
          </div>
          <article className="rounded-[1.5rem] border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="text-sm font-semibold text-black dark:text-white">
              What we help with
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              Design systems, AI-assisted design workflows, scalable UI
              foundations, and product design that can move from concept to
              production.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="text-sm font-semibold text-black dark:text-white">
              What to read next
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              Explore the{" "}
              <Link href="/work" className="underline underline-offset-4">
                portfolio
              </Link>{" "}
              for project proof or the{" "}
              <Link href="/blog" className="underline underline-offset-4">
                blog
              </Link>{" "}
              for design systems and AI-native workflow thinking.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-black/10 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="text-sm font-semibold text-black dark:text-white">
              Who this is for
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/70 dark:text-white/70">
              Product teams, design leaders, and companies that need clearer
              design system decisions, stronger implementation quality, or
              practical AI design adoption.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
