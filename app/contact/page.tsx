import type { Metadata } from "next";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact | Digitaltableteur",
  description:
    "Get in touch with Digitaltableteur for design systems consulting, AI-powered DesignOps solutions, component library development, and design automation projects.",
  openGraph: {
    title: "Contact | Digitaltableteur",
    description:
      "Get in touch with Digitaltableteur for design systems consulting, AI-powered DesignOps solutions, component library development, and design automation projects.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Digitaltableteur",
    description:
      "Get in touch with Digitaltableteur for design systems consulting, AI-powered DesignOps solutions, component library development, and design automation projects.",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
