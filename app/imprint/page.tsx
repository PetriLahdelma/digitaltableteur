import type { Metadata } from "next";

import { ImprintPage } from "@dt-pages/ImprintPage";

export const metadata: Metadata = {
  title: "Imprint | Digitaltableteur",
  description:
    "Legal business information for Digitaltableteur, including business form, address, contact email, Business ID, trade register details, and VAT ID.",
  openGraph: {
    title: "Imprint | Digitaltableteur",
    description:
      "Legal business information for Digitaltableteur, including business form, address, contact email, Business ID, trade register details, and VAT ID.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imprint | Digitaltableteur",
    description:
      "Legal business information for Digitaltableteur, including business form, address, contact email, Business ID, trade register details, and VAT ID.",
  },
  alternates: {
    canonical: "/imprint",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export const revalidate = 3600;

export default function Imprint() {
  return <ImprintPage />;
}
