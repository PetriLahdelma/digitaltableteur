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
  const title = `${audience.name} Guides | Digitaltableteur`;
  const description = audience.shortDescription;
  const ogImage = `${siteBase}/logo512.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "Digitaltableteur",
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: audience.name,
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
