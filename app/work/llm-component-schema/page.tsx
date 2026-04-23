import type { Metadata } from "next";

import { LlmComponentSchemaPage } from "@dt-pages/Work/LlmComponentSchema";
import { NextWorkNav } from "../NextWorkNav";

export const metadata: Metadata = {
  title:
    "LLM Component Schema: Component Contracts for AI | Digitaltableteur",
  description:
    "A published npm schema and CLI for component contracts that AI agents can consume, with drift detection and eval benchmarks.",
  openGraph: {
    title:
      "LLM Component Schema: Component Contracts for AI | Digitaltableteur",
    description:
      "A published npm schema and CLI for component contracts that AI agents can consume, with drift detection and eval benchmarks.",
    type: "article",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "LLM Component Schema: Component Contracts for AI | Digitaltableteur",
    description:
      "A published npm schema and CLI for component contracts that AI agents can consume, with drift detection and eval benchmarks.",
  },
  alternates: {
    canonical: "/work/llm-component-schema",
  },
};

export const revalidate = 3600;

export default function LlmComponentSchema() {
  return <LlmComponentSchemaPage nav={<NextWorkNav />} />;
}
