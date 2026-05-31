import type { Metadata } from "next";

import { SitemapPage } from "@dt-pages/SitemapPage";
import {
  getBreadcrumbSchema,
  getWebPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";

export const metadata: Metadata = {
  title: "Sitemap | Digitaltableteur",
  description:
    "Browse every page on digitaltableteur.com — work, blog, guides, and legal information.",
  openGraph: {
    title: "Sitemap | Digitaltableteur",
    description:
      "Browse every page on digitaltableteur.com — work, blog, guides, and legal information.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary",
    title: "Sitemap | Digitaltableteur",
    description:
      "Browse every page on digitaltableteur.com — work, blog, guides, and legal information.",
  },
  alternates: {
    canonical: "/sitemap",
  },
};

export const revalidate = 600;

export default function Sitemap() {
  const structuredData = [
    getWebPageSchema({
      name: "Sitemap | Digitaltableteur",
      description:
        "Browse every page on digitaltableteur.com — work, blog, guides, and legal information.",
      url: "/sitemap",
    }),
    getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Sitemap", url: "/sitemap" },
    ]),
  ];

  return (
    <>
      <script
        id="schema-sitemap"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <SitemapPage />
    </>
  );
}
