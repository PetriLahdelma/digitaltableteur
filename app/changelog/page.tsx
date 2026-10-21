import type { Metadata } from "next";

import { SiteChangelogPage } from "@dt-pages/SiteChangelog";

const title = "Changelog | Digitaltableteur";
const description =
  "Every feature shipped on digitaltableteur.com and its design system, month by month from git history, each linked to its commit.";

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
  return <SiteChangelogPage />;
}
