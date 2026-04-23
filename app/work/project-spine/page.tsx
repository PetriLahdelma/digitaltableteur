import type { Metadata } from "next";

import { ProjectSpinePage } from "@dt-pages/Work/ProjectSpine";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "Project Spine: Agent-Native Context CLI | Digitaltableteur",
  description:
    "An OSS CLI that compiles briefs, repos, and design tokens into structured operating context for AI coding agents.",
  openGraph: {
    title: "Project Spine: Agent-Native Context CLI | Digitaltableteur",
    description:
      "An OSS CLI that compiles briefs, repos, and design tokens into structured operating context for AI coding agents.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Spine: Agent-Native Context CLI | Digitaltableteur",
    description:
      "An OSS CLI that compiles briefs, repos, and design tokens into structured operating context for AI coding agents.",
  },
  alternates: {
    canonical: "/work/project-spine",
  },
};

export const revalidate = 3600;

export default function ProjectSpine() {
  return <ProjectSpinePage nav={<NextWorkNav />} />;
}
