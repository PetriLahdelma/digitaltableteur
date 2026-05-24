import type { Metadata } from "next";

import { DSharpDesignSystemPage } from "@dt-pages/Work/DSharpDesignSystem";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title: "DSharp Design System: AI-Powered Architecture | Digitaltableteur",
  description:
    "Fully AI-powered and guardrailed design-system architecture for enterprise data products: tokens, contracts, Storybook, MCP, CLI, and Rhythmguard enforcement.",
  openGraph: {
    title: "DSharp Design System: AI-Powered Architecture | Digitaltableteur",
    description:
      "Fully AI-powered and guardrailed design-system architecture for enterprise data products: tokens, contracts, Storybook, MCP, CLI, and Rhythmguard enforcement.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSharp Design System: AI-Powered Architecture | Digitaltableteur",
    description:
      "Fully AI-powered and guardrailed design-system architecture for enterprise data products.",
  },
  alternates: {
    canonical: "/work/dsharp-design-system",
  },
};

export const revalidate = 3600;

export default function DSharpDesignSystem() {
  return <DSharpDesignSystemPage nav={<NextWorkNav />} />;
}
