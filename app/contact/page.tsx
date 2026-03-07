import type { Metadata } from "next";
import Script from "next/script";
import { ContactContent } from "./ContactContent";
import {
  getContactPageSchema,
  getBreadcrumbSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";

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
  const structuredData = [
    getContactPageSchema({
      name: "Contact Digitaltableteur",
      description:
        "Contact Digitaltableteur about design systems consulting, AI-powered DesignOps, component libraries, and digital product work.",
      url: "/contact",
      email: "mail@digitaltableteur.com",
    }),
    getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" },
    ]),
  ];

  return (
    <>
      <Script
        id="schema-contact"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <ContactContent />
    </>
  );
}
