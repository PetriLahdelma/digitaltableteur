import type { Metadata } from "next";

import { StudioLogPage } from "@dt-pages/StudioLog";

const title = "Timeline: two decades of design work | Digitaltableteur";
const description =
  "Every dated Digitaltableteur event since 2002: roles, client work, design systems, launches, writing and talks, linked to public proof where it exists.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  alternates: {
    canonical: "/timeline",
  },
};

export const revalidate = 3600;

export default function Timeline() {
  return <StudioLogPage />;
}
