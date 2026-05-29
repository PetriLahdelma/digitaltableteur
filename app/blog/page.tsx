import type { Metadata } from "next";

import { BlogPage } from "@dt-pages/Blog";

export const metadata: Metadata = {
  title: "Blog | Digitaltableteur",
  description:
    "Articles on design systems, component architecture, AI-powered workflows, and DesignOps. Expert insights on React, TypeScript, and Figma.",
  openGraph: {
    title: "Blog | Digitaltableteur",
    description:
      "Articles on design systems, component architecture, AI-powered workflows, and DesignOps. Expert insights on React, TypeScript, and Figma.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Digitaltableteur",
    description:
      "Articles on design systems, component architecture, AI-powered workflows, and DesignOps. Expert insights on React, TypeScript, and Figma.",
  },
  alternates: {
    canonical: "/blog",
  },
};

export const revalidate = 600;

export default function Blog() {
  return <BlogPage />;
}
