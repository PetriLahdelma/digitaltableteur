import type { Metadata } from "next";

import { StudioLogPage } from "@dt-pages/StudioLog";

const title = "Changelog | Digitaltableteur";
const description =
  "Every dated Digitaltableteur event since 2009: client design systems, case studies, articles, talks and @digitaltableteur/react releases, each linked to its proof.";

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
    canonical: "/changelog",
  },
};

export const revalidate = 3600;

export default function Changelog() {
  return <StudioLogPage />;
}
