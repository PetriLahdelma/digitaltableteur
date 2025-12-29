import type { Metadata } from "next";

import { PrivacyPolicyPage } from "@dt-pages/PrivacyPolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Digitaltableteur",
  description:
    "Digitaltableteur privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and EU privacy regulations.",
  openGraph: {
    title: "Privacy Policy | Digitaltableteur",
    description:
      "Digitaltableteur privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and EU privacy regulations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Digitaltableteur",
    description:
      "Digitaltableteur privacy policy. Learn how we collect, use, and protect your personal data in compliance with GDPR and EU privacy regulations.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

// Cache for an hour; content is static
export const revalidate = 3600;

export default function PrivacyPolicy() {
  return <PrivacyPolicyPage />;
}
