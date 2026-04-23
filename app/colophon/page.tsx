import type { Metadata } from "next";

import { ColophonPage } from "@dt-pages/Colophon";

export const metadata: Metadata = {
  title: "Colophon — How This Site Is Built | Digitaltableteur",
  description:
    "The architecture behind digitaltableteur.com: a 100-component design system, 4 theme modes, 3 languages, and the tools that make it work.",
  openGraph: {
    title: "Colophon �� How This Site Is Built | Digitaltableteur",
    description:
      "The architecture behind digitaltableteur.com: a 100-component design system, 4 theme modes, 3 languages, and the tools that make it work.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Colophon — How This Site Is Built | Digitaltableteur",
    description:
      "The architecture behind digitaltableteur.com: a 100-component design system, 4 theme modes, 3 languages, and the tools that make it work.",
  },
  alternates: {
    canonical: "/colophon",
  },
};

export const revalidate = 3600;

export default function Colophon() {
  return <ColophonPage />;
}
