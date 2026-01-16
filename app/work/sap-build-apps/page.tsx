import type { Metadata } from "next";

import { SapBuildAppsPage } from "@dt-pages/Work/SapBuildApps";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "SAP Build Apps Design System | Digitaltableteur",
  description:
    "Design system lead for SAP Build Apps — SAP's flagship low-code platform. 100+ Figma and React/TypeScript components serving 300+ developers and designers.",
  openGraph: {
    title: "SAP Build Apps Design System | Digitaltableteur",
    description:
      "Design system lead for SAP Build Apps — SAP's flagship low-code platform. 100+ Figma and React/TypeScript components serving 300+ developers and designers.",
    type: "article",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/images/portfolio/sap-build-apps/hero-background.webp",
        width: 1200,
        height: 600,
        alt: "SAP Build Apps design system components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAP Build Apps Design System | Digitaltableteur",
    description:
      "Design system lead for SAP Build Apps — SAP's flagship low-code platform. 100+ Figma and React/TypeScript components serving 300+ developers and designers.",
    images: ["/images/portfolio/sap-build-apps/hero-background.webp"],
  },
  alternates: {
    canonical: "/work/sap-build-apps",
  },
};

export const revalidate = 3600;

export default function SapBuildApps() {
  return <SapBuildAppsPage nav={<NextWorkNav />} />;
}
