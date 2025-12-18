import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPseoCatalog,
  getPseoLeafPageBySlug,
  getPseoLeafPages,
  getRelatedPseoLeafPages,
} from "@/lib/pseo/catalog";
import { getPseoPageCopy } from "@/lib/pseo/copy";
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
  return {
    title: `${page.title} | Digitaltableteur`,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      title: page.title,
      description: page.description,
      url,
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

  return <PseoLeafPageView page={page} copy={copy} relatedPages={relatedPages} />;
}

