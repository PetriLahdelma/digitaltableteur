import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPseoCatalog,
  getPseoLeafPages,
  getPseoServiceBySlug,
} from "@/lib/pseo/catalog";
import { PseoPillarPage } from "@dt-pages/Pseo/PseoPillarPage";

type Params = { slug: string };

const siteBase =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export async function generateStaticParams(): Promise<Params[]> {
  return getPseoCatalog().services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getPseoServiceBySlug(slug);
  if (!service) return {};
  const url = `${siteBase}/pseo/services/${service.slug}`;
  const title = `${service.name} Guides | Digitaltableteur`;
  const description = service.shortDescription;
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
          alt: service.name,
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

export default async function PseoServiceRoute({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getPseoServiceBySlug(slug);
  if (!service) notFound();

  const catalog = getPseoCatalog();
  const leafPages = getPseoLeafPages().filter(
    (page) => page.service.slug === service.slug,
  );

  return (
    <PseoPillarPage
      kind="services"
      item={service}
      leafPages={leafPages}
      siblingItems={catalog.services}
    />
  );
}
