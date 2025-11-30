import type { Metadata } from "next";

import { HomePage } from "@/shared/components/pages/Home/HomePage";

export const metadata: Metadata = {
  title: "Digitaltableteur | Design Systems & AI-Powered DesignOps",
  description:
    "Professional design systems, AI-native workflows, and scalable design operations. Specializing in component libraries, design tokens, and intelligent automation for modern product teams.",
};

export const revalidate = 3600;

export default function Home() {
  return <HomePage />;
}
