import type { Metadata } from "next";

import { BlogPage } from "@/nextjs-app/shared/components/pages/Blog";

export const metadata: Metadata = {
  title: "Blog | Digitaltableteur",
  description:
    "Articles on design systems, component architecture, AI-powered workflows, and modern DesignOps practices. Expert insights on React, TypeScript, and Figma integration.",
};

export const revalidate = 600;

export default function Blog() {
  return <BlogPage />;
}
