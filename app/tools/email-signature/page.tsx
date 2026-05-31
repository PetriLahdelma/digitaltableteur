import type { Metadata } from "next";
import { EmailSignatureContent } from "./EmailSignatureContent";

export const metadata: Metadata = {
  title: "Email Signature Generator | Digitaltableteur",
  description: "Internal email signature generator for Digitaltableteur team use.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/tools/email-signature",
  },
};

export default function EmailSignaturePage() {
  return <EmailSignatureContent />;
}
