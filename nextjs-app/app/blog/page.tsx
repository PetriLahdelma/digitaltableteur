import type { Metadata } from "next";

import { BlogPage } from "@dt-pages/Blog";

export const metadata: Metadata = {
  title: "Blog | Digitaltableteur",
  description: "Selected articles by Digitaltableteur.",
};

export const revalidate = 600;

export default function Blog() {
  return <BlogPage />;
}
