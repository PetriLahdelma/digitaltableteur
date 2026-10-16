import type { Metadata } from "next";

import { HelsinkiDesignSystemPage } from "@dt-pages/Work/HelsinkiDesignSystem";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Helsinki Design System Case Study | Digitaltableteur",
  description:
    "Enterprise design system for the City of Helsinki: user research, design process, component library and measurable impact across multivendor services. WCAG AA.",
  openGraph: {
    title: "Helsinki Design System Case Study | Digitaltableteur",
    description:
      "Enterprise design system for the City of Helsinki: user research, design process, component library and measurable impact across multivendor services. WCAG AA.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Helsinki Design System Case Study | Digitaltableteur",
    description:
      "Enterprise design system for the City of Helsinki: user research, design process, component library and measurable impact across multivendor services. WCAG AA.",
  },
  alternates: {
    canonical: "/work/helsinki-design-system",
  },
};

export const revalidate = 3600;

export default function HelsinkiDesignSystem() {
  return <HelsinkiDesignSystemPage nav={<NextWorkNav />} />;
}
