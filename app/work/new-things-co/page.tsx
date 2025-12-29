import type { Metadata } from "next";

import { NewThingsCoPage } from "@dt-pages/Work/NewThingsCo";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "New Things Co Case Study | Digitaltableteur",
  description:
    "Comprehensive branding, design system development, and web design for New Things Co. Full-stack design solution from concept to implementation.",
  openGraph: {
    title: "New Things Co Case Study | Digitaltableteur",
    description:
      "Comprehensive branding, design system development, and web design for New Things Co. Full-stack design solution from concept to implementation.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Things Co Case Study | Digitaltableteur",
    description:
      "Comprehensive branding, design system development, and web design for New Things Co. Full-stack design solution from concept to implementation.",
  },
  alternates: {
    canonical: "/work/new-things-co",
  },
};

export const revalidate = 3600;

export default function NewThingsCo() {
  return <NewThingsCoPage nav={<NextWorkNav />} />;
}
