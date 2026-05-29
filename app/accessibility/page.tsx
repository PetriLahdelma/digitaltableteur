import type { Metadata } from "next";

import { AccessibilityPage } from "@dt-pages/AccessibilityPage";

export const metadata: Metadata = {
  title: "Accessibility Statement | Digitaltableteur",
  description:
    "Digitaltableteur's commitment to web accessibility. WCAG 2.1 AA compliance, keyboard navigation, screen reader support, and accessible design practices.",
  openGraph: {
    title: "Accessibility Statement | Digitaltableteur",
    description:
      "Digitaltableteur's commitment to web accessibility. WCAG 2.1 AA compliance, keyboard navigation, screen reader support, and accessible design practices.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility Statement | Digitaltableteur",
    description:
      "Digitaltableteur's commitment to web accessibility. WCAG 2.1 AA compliance, keyboard navigation, screen reader support, and accessible design practices.",
  },
  alternates: {
    canonical: "/accessibility",
  },
};

export const revalidate = 3600;

export default function AccessibilityStatement() {
  return <AccessibilityPage />;
}
