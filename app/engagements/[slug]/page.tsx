import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EngagementPage } from "@dt-pages/EngagementPage";
import {
  ENGAGEMENTS,
  getEngagementBySlug,
  getEngagementPath,
} from "@/nextjs-app/shared/data/engagements";
import en from "@/nextjs-app/shared/locales/en/translation.json";
import { procurementFaqEntries } from "@/app/lib/procurementFaq";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  getServiceSchema,
  getWebPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";
import {
  getEngagementEntry,
  toServiceSchemaOptions,
} from "@/app/lib/engagementCatalog";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const revalidate = 3600;

export function generateStaticParams() {
  return ENGAGEMENTS.map((engagement) => ({ slug: engagement.slug }));
}

function copyFor(slug: string) {
  const engagement = getEngagementBySlug(slug);
  if (!engagement) return null;
  return { engagement, copy: en.engagementPages[engagement.id] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = copyFor((await params).slug);
  if (!found) return {};
  const { engagement, copy } = found;
  const path = getEngagementPath(engagement);
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      type: "website",
      siteName: "Digitaltableteur",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: copy.metaTitle,
      description: copy.metaDescription,
    },
    alternates: {
      canonical: path,
      types: { "text/markdown": `${path}/markdown` },
    },
  };
}

export default async function EngagementRoute({ params }: Props) {
  const found = copyFor((await params).slug);
  if (!found) notFound();
  const { engagement, copy } = found;
  const path = getEngagementPath(engagement);

  const entry = getEngagementEntry(engagement.slug);

  // Both FAQs on the page are visible, so both feed the FAQPage data.
  const structuredData = [
    ...(entry ? [getServiceSchema(toServiceSchemaOptions(entry))] : []),
    getWebPageSchema({
      name: copy.metaTitle,
      description: copy.metaDescription,
      url: path,
    }),
    getFaqSchema([...copy.faq, ...procurementFaqEntries]),
    getBreadcrumbSchema([
      { name: en.engagementPages.common.breadcrumbHome, url: "/" },
      { name: en.engagementPages.common.breadcrumbPricing, url: "/pricing" },
      { name: copy.eyebrow, url: path },
    ]),
  ];

  return (
    <>
      <script
        id={`schema-engagement-${engagement.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(structuredData) }}
      />
      <EngagementPage engagementId={engagement.id} />
    </>
  );
}
