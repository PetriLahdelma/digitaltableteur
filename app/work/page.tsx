import type { Metadata } from "next";

import { WorkIndexPage } from "@/shared/components/pages/Work/WorkIndex";

export const metadata: Metadata = {
  title: "Work | Digitaltableteur",
  description:
    "Portfolio of design systems, UI components, and product design work. Explore case studies showcasing scalable design solutions and AI-powered automation projects.",
};

export const revalidate = 3600;

export default function Work() {
  return <WorkIndexPage />;
}
