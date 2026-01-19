import type { Metadata } from "next";

import { FinnishTransportAgencyPage } from "@dt-pages/Work/FinnishTransportAgency";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Finnish Transport Agency Case Study | Digitaltableteur",
  description:
    "Identity system for the merged Finnish Transport Agency, built for multilingual public services and national infrastructure.",
  openGraph: {
    title: "Finnish Transport Agency Case Study | Digitaltableteur",
    description:
      "Identity system for the merged Finnish Transport Agency, built for multilingual public services and national infrastructure.",
    type: "article",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/images/portfolio/finnish-transport-agency/hero.png",
        width: 1343,
        height: 729,
        alt: "Finnish Transport Agency identity presentation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finnish Transport Agency Case Study | Digitaltableteur",
    description:
      "Identity system for the merged Finnish Transport Agency, built for multilingual public services and national infrastructure.",
    images: ["/images/portfolio/finnish-transport-agency/hero.png"],
  },
  alternates: {
    canonical: "/work/finnish-transport-agency",
  },
};

export const revalidate = 3600;

export default function FinnishTransportAgency() {
  return <FinnishTransportAgencyPage nav={<NextWorkNav />} />;
}
