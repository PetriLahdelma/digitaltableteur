import type { Metadata } from "next";
import { ContactContent } from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact | Digitaltableteur",
  description:
    "Contact Digitaltableteur for design systems consulting, AI-powered DesignOps, component libraries, and design automation projects.",
  openGraph: {
    title: "Contact | Digitaltableteur",
    description:
      "Contact Digitaltableteur for design systems consulting, AI-powered DesignOps, component libraries, and design automation projects.",
    type: "website",
    siteName: "Digitaltableteur",
    images: [
      {
        url: "/logo512.png",
        width: 512,
        height: 512,
        alt: "Digitaltableteur Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Digitaltableteur",
    description:
      "Contact Digitaltableteur for design systems consulting, AI-powered DesignOps, component libraries, and design automation projects.",
    images: ["/logo512.png"],
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
