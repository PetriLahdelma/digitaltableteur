import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPseoAudienceBySlug,
  getPseoCatalog,
  getPseoLeafPages,
} from "@/lib/pseo/catalog";
import { PseoPillarPage } from "@dt-pages/Pseo/PseoPillarPage";

type Params = { slug: string };

const siteBase =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export async function generateStaticParams(): Promise<Params[]> {
  return getPseoCatalog().audiences.map((audience) => ({
    slug: audience.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const audience = getPseoAudienceBySlug(slug);
  if (!audience) return {};
  const url = `${siteBase}/pseo/audiences/${audience.slug}`;
  return {
    title: `${audience.name} Guides | Digitaltableteur`,
    description: audience.shortDescription,
    alternates: { canonical: url },
  };
}

export default async function PseoAudienceRoute({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const audience = getPseoAudienceBySlug(slug);
  if (!audience) notFound();

  const catalog = getPseoCatalog();
  const leafPages = getPseoLeafPages().filter(
    (page) => page.audience.slug === audience.slug,
  );

  return (
    <PseoPillarPage
      kind="audiences"
      item={audience}
      leafPages={leafPages}
      siblingItems={catalog.audiences}
    />
  );
}
