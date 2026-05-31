import type { Metadata } from "next";

import { ColophonPage } from "@dt-pages/Colophon";

export const metadata: Metadata = {
  title: "Colophon — How This Site Is Built | Digitaltableteur",
  description:
    "How digitaltableteur.com is built: 200+ components, 12 case studies, crawlable blog, programmatic SEO, Donny AI chat, and agent-native tooling.",
  openGraph: {
    title: "Colophon — How This Site Is Built | Digitaltableteur",
    description:
      "How digitaltableteur.com is built: 200+ components, 12 case studies, crawlable blog, programmatic SEO, Donny AI chat, and agent-native tooling.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Colophon — How This Site Is Built | Digitaltableteur",
    description:
      "How digitaltableteur.com is built: 200+ components, 12 case studies, crawlable blog, programmatic SEO, Donny AI chat, and agent-native tooling.",
  },
  alternates: {
    canonical: "/colophon",
  },
};

export const revalidate = 3600;

export default function Colophon() {
  return <ColophonPage />;
}
