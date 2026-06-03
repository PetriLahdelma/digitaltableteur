import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactContent } from "./ContactContent";
import { contactFaqs } from "@/app/lib/aeoContent";
import {
  getContactPageSchema,
  getBreadcrumbSchema,
  getFaqSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";
import { resolveSiteBookingConfig } from "@/nextjs-app/shared/lib/donny-booking";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Digitaltableteur",
    description:
      "Contact Digitaltableteur for design systems consulting, AI-powered DesignOps, component libraries, and design automation projects.",
  },
  alternates: {
    canonical: "/contact",
  },
};

type ContactSearchParams = {
  mode?: string;
  package?: string;
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<ContactSearchParams>;
}) {
  const params = await searchParams;
  const initialInquiryMode =
    params.mode === "book" || params.mode === "message" ? params.mode : undefined;
  const bookingPackageId = params.package?.trim() || undefined;
  const bookingConfig = resolveSiteBookingConfig({
    packageId: bookingPackageId,
  });

  const structuredData = [
    getContactPageSchema({
      name: "Contact Digitaltableteur",
      description:
        "Contact Digitaltableteur about design systems consulting, AI-powered DesignOps, component libraries, and digital product work.",
      url: "/contact",
      email: "mail@digitaltableteur.com",
    }),
    getFaqSchema(contactFaqs),
    getBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Contact", url: "/contact" },
    ]),
  ];

  return (
    <>
      <script
        id="schema-contact"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(structuredData),
        }}
      />
      <Suspense fallback={null}>
        <ContactContent
          initialInquiryMode={initialInquiryMode}
          bookingPackageId={bookingPackageId}
          bookingConfig={bookingConfig}
        />
      </Suspense>
    </>
  );
}
