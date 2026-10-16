import type { Metadata } from "next";

import { PricingPage } from "@dt-pages/PricingPage";
import { procurementFaqEntries } from "@/app/lib/procurementFaq";
import {
  getBreadcrumbSchema,
  getFaqSchema,
  getOfferCatalogSchema,
  getWebPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";
import {
  getEngagementEntries,
  toServiceSchemaOptions,
} from "@/app/lib/engagementCatalog";

export const metadata: Metadata = {
  title: "Pricing | Digitaltableteur",
  description:
    "Productized design, UX/UI and DesignOps packages from €7k. AI-ready workflows, fixed scope and senior delivery without bloated agency retainers.",
  openGraph: {
    title: "Pricing | Digitaltableteur",
    description:
      "Productized design, UX/UI and DesignOps packages from €7k. AI-ready workflows, fixed scope and senior delivery without bloated agency retainers.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Digitaltableteur",
    description:
      "Productized design, UX/UI and DesignOps packages from €7k. AI-ready workflows, fixed scope and senior delivery without bloated agency retainers.",
  },
  alternates: {
    canonical: "/pricing",
  },
};

export const revalidate = 3600;

export default function Pricing() {
  const structuredData = [
    getWebPageSchema({
      name: "Pricing | Digitaltableteur",
      description:
        "Productized design, UX/UI and DesignOps packages from €7k. AI-ready workflows, fixed scope and senior delivery.",
      url: "/pricing",
      keywords: [
        "design pricing",
        "design systems consulting",
        "DesignOps packages",
        "UX/UI pricing",
      ],
    }),
    // Every package card links to its offer page; the catalog names them all.
    getOfferCatalogSchema(
      "Digitaltableteur engagements",
      "/pricing",
      getEngagementEntries().map(toServiceSchemaOptions),
    ),
    // The visible procurement FAQ on the page is the FAQPage source.
    getFaqSchema(procurementFaqEntries),
    getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Pricing", url: "/pricing" },
    ]),
  ];

  return (
    <>
      <script
        id="schema-pricing"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <PricingPage />
    </>
  );
}
