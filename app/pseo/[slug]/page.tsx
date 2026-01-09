import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

import {
  getPseoCatalog,
  getPseoLeafPageBySlug,
  getPseoLeafPages,
  getRelatedPseoLeafPages,
} from "@/lib/pseo/catalog";
import { getPseoPageCopy } from "@/lib/pseo/copy";
import {
  getBreadcrumbSchema,
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
  const ogImage = `${siteBase}/logo512.png`;

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
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
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

  const url = `${siteBase}/pseo/${page.slug}`;
  const structuredData = [
    getWebPageSchema({
      name: page.title,
      description: page.description,
      url,
      keywords: page.tags,
    }),
    getBreadcrumbSchema([
      { name: "Home", url: siteBase },
      { name: "PSEO", url: `${siteBase}/pseo` },
      {
        name: page.service.name,
        url: `${siteBase}/pseo/services/${page.service.slug}`,
      },
      { name: page.stack.name, url: `${siteBase}/pseo/stacks/${page.stack.slug}` },
      {
        name: page.audience.name,
        url: `${siteBase}/pseo/audiences/${page.audience.slug}`,
      },
      { name: page.title, url },
    ]),
  ];

  return (
    <>
      <Script
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
