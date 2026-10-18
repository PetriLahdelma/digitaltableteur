"use client";

import { useSearchParams } from "next/navigation";
import { ContactPageContentEditorial } from "../../../patterns/ContactPageContentEditorial";
import type { ContactInquiryMode } from "../../../patterns/ContactInquiryPanel";
import type { SiteBookingConfig } from "../../../lib/donny-booking";

/** A ?mode= deep link, or undefined so the panel picks its default (booking
 *  when scheduling is configured). */
function readInquiryMode(
  value: string | null | undefined,
): ContactInquiryMode | undefined {
  if (value === "book" || value === "message") return value;
  return undefined;
}

export interface ContactPageProps {
  /** Resolved on the server from ?mode= for a stable first paint. */
  initialInquiryMode?: ContactInquiryMode;
  /** Resolved on the server from ?package= for a stable first paint. */
  bookingPackageId?: string;
  /** Resolved on the server from env so contact booking URLs stay in sync. */
  bookingConfig?: SiteBookingConfig;
}

export function ContactPage({
  initialInquiryMode: serverInquiryMode,
  bookingPackageId: serverPackageId,
  bookingConfig,
}: ContactPageProps = {}) {
  const searchParams = useSearchParams();
  const inquiryMode = readInquiryMode(
    searchParams.get("mode") ?? serverInquiryMode,
  );
  const packageId = searchParams.get("package") ?? serverPackageId;

  return (
    <ContactPageContentEditorial
      initialInquiryMode={inquiryMode}
      bookingPackageId={packageId}
      bookingConfig={bookingConfig}
    />
  );
}

ContactPage.displayName = "ContactPage";
