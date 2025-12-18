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
  return {
    title: `${service.name} Guides | Digitaltableteur`,
    description: service.shortDescription,
    alternates: { canonical: url },
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

