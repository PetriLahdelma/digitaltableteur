import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPseoCatalog,
  getPseoLeafPageBySlug,
  getPseoLeafPages,
  getRelatedPseoLeafPages,
} from "@/lib/pseo/catalog";
import { getPseoPageCopy } from "@/lib/pseo/copy";
import { mergeLeafCopy } from "@/lib/pseo/leaf-blocks";
import { isPseoLeafIndexable } from "@/lib/pseo/indexing";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  getWebPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";
import { PseoLeafPageView } from "@dt-pages/Pseo/PseoLeafPage";

type Params = { slug: string };

const siteBase =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export async function generateStaticParams(): Promise<Params[]> {
  return getPseoLeafPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPseoLeafPageBySlug(slug);
  if (!page) return {};

  const url = `${siteBase}/pseo/${page.slug}`;
  const title = `${page.title} | Digitaltableteur`;
  const description = page.description;
  const indexable = isPseoLeafIndexable(slug);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Digitaltableteur",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: indexable,
      follow: true,
    },
  };
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_`]/g, "")
    .trim();
}

export default async function PseoLeafRoute({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const page = getPseoLeafPageBySlug(slug);
  if (!page) notFound();

  const copy = getPseoPageCopy(slug);
  const relatedLimit = getPseoCatalog().generation?.relatedLinksPerPage ?? 8;
  const relatedPages = getRelatedPseoLeafPages(page, relatedLimit);
  const { blocks } = mergeLeafCopy(page, copy);

  const url = `${siteBase}/pseo/${page.slug}`;
  const structuredData: Record<string, unknown>[] = [
    getWebPageSchema({
      name: page.title,
      description: page.description,
      url,
      keywords: page.tags,
    }),
    getBreadcrumbSchema([
      { name: "Home", url: siteBase },
      { name: "Playbooks", url: `${siteBase}/pseo` },
      {
        name: page.service.name,
        url: `${siteBase}/pseo/services/${page.service.slug}`,
      },
      {
        name: page.stack.displayName ?? page.stack.name,
        url: `${siteBase}/pseo/stacks/${page.stack.slug}`,
      },
      {
        name: page.audience.name,
        url: `${siteBase}/pseo/audiences/${page.audience.slug}`,
      },
      { name: page.title, url },
    ]),
  ];

  if (blocks.faqs.length > 0) {
    structuredData.push(
      getFaqSchema(
        blocks.faqs.map((faq) => ({
          question: faq.question,
          answer: stripMarkdown(faq.answerMarkdown),
        })),
      ),
    );
  }

  return (
    <>
      <script
        id="schema-pseo"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <PseoLeafPageView page={page} copy={copy} relatedPages={relatedPages} />
    </>
  );
}
