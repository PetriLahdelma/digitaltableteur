import type { Metadata } from "next";

import { PrivacyPolicyPage } from "@dt-pages/PrivacyPolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Digitaltableteur",
  description:
    "Digitaltableteur privacy policy: how your personal data is collected, used and protected in compliance with GDPR and EU privacy regulations.",
  openGraph: {
    title: "Privacy Policy | Digitaltableteur",
    description:
      "Digitaltableteur privacy policy: how your personal data is collected, used and protected in compliance with GDPR and EU privacy regulations.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Digitaltableteur",
    description:
      "Digitaltableteur privacy policy: how your personal data is collected, used and protected in compliance with GDPR and EU privacy regulations.",
  },
  alternates: {
    canonical: "/privacy-policy",
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
