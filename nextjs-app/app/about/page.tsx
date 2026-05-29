import type { Metadata } from "next";

import { AboutPage } from "@dt-pages/AboutPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "About | Digitaltableteur";
  const description =
    "Learn about Digitaltableteur design studio specializing in Design Systems and AI-powered DesignOps";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function About() {
  return <AboutPage />;
}
