import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPseoCatalog,
  getPseoLeafPages,
  getPseoStackBySlug,
} from "@/lib/pseo/catalog";
import { PseoPillarPage } from "@dt-pages/Pseo/PseoPillarPage";

type Params = { slug: string };

const siteBase =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.digitaltableteur.com";

export async function generateStaticParams(): Promise<Params[]> {
  return getPseoCatalog().stacks.map((stack) => ({ slug: stack.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stack = getPseoStackBySlug(slug);
  if (!stack) return {};
  const url = `${siteBase}/pseo/stacks/${stack.slug}`;
  const title = `${stack.name} Design System Guides | Digitaltableteur`;
  const description = stack.shortDescription;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PseoStackRoute({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const stack = getPseoStackBySlug(slug);
  if (!stack) notFound();

  const catalog = getPseoCatalog();
  const leafPages = getPseoLeafPages().filter(
    (page) => page.stack.slug === stack.slug,
  );

  return (
    <PseoPillarPage
      kind="stacks"
      item={stack}
      leafPages={leafPages}
      siblingItems={catalog.stacks}
    />
  );
}
