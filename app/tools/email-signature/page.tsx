import type { Metadata } from "next";
import { EmailSignatureContent } from "./EmailSignatureContent";

export const metadata: Metadata = {
  title: "Email Signature Generator | Digitaltableteur",
  description:
    "Create a professional email signature with our free generator. Includes live preview, dark mode toggle, and easy copy-to-clipboard for Gmail, macOS Mail, and iOS Mail.",
  openGraph: {
    title: "Email Signature Generator | Digitaltableteur",
    description:
      "Create a professional email signature with our free generator. Includes live preview, dark mode toggle, and easy copy-to-clipboard.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Email Signature Generator | Digitaltableteur",
    description:
      "Create a professional email signature with our free generator. Includes live preview, dark mode toggle, and easy copy-to-clipboard.",
  },
  alternates: {
    canonical: "/tools/email-signature",
  },
};

export default function EmailSignaturePage() {
  return <EmailSignatureContent />;
}
