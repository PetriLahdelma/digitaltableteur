import { afterEach, describe, expect, it } from "vitest";
import {
  getSiteBookingSetupStatus,
  isAllowedSiteBookingEmbedUrl,
  resolveSiteBookingConfig,
  resolveSiteBookingProvider,
} from "./donny-booking";

describe("site booking config", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("prefers Cal.com when base URL is configured", () => {
    process.env.NEXT_PUBLIC_SITE_BOOKING_PROVIDER = "calcom";
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE =
      "https://cal.com/digitaltableteur";

    expect(resolveSiteBookingProvider()).toBe("calcom");

    const result = resolveSiteBookingConfig({
      packageId: "ux-sprint",
      name: "Alex",
      email: "alex@example.com",
    });

    expect(result.configured).toBe(true);
    expect(result.embedUrl).toContain(
      "https://app.cal.com/digitaltableteur/ux-sprint/embed",
    );
    expect(result.embedUrl).toContain("embed=true");
  });

  it("reports missing env vars when not configured", () => {
    delete process.env.NEXT_PUBLIC_SITE_BOOKING_PROVIDER;
    delete process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE;
    delete process.env.NEXT_PUBLIC_SITE_BOOKING_CALENDLY_URL;

    const status = getSiteBookingSetupStatus();
    expect(status.configured).toBe(false);
    expect(status.missing.length).toBeGreaterThan(0);
  });

  it("builds Calendly inline embed URLs", () => {
    process.env.NEXT_PUBLIC_SITE_BOOKING_PROVIDER = "calendly";
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALENDLY_URL =
      "https://calendly.com/digitaltableteur/discovery";

    const result = resolveSiteBookingConfig({
      email: "alex@example.com",
    });

    expect(result.configured).toBe(true);
    expect(result.provider).toBe("calendly");
    expect(result.embedUrl).toContain("embed_type=Inline");
  });

  it("uses a full event URL from CALCOM_BASE without appending another slug", () => {
    process.env.NEXT_PUBLIC_SITE_BOOKING_PROVIDER = "calcom";
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE =
      "https://cal.com/petri-lahdelma/30min";

    const result = resolveSiteBookingConfig();

    expect(result.embedUrl).toContain(
      "https://app.cal.com/petri-lahdelma/30min/embed",
    );
    expect(result.fallbackUrl).toBe("https://cal.com/petri-lahdelma/30min");
  });

  it("prefers env default event over generic meetingType discovery", () => {
    process.env.NEXT_PUBLIC_SITE_BOOKING_PROVIDER = "calcom";
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE =
      "https://cal.eu/digitaltableteur";
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_DEFAULT_EVENT = "30min";

    const result = resolveSiteBookingConfig({ meetingType: "discovery" });

    expect(result.fallbackUrl).toBe("https://cal.eu/digitaltableteur/30min");
    expect(result.embedUrl).toContain(
      "https://app.cal.eu/digitaltableteur/30min/embed",
    );
  });

  it("builds Cal.eu embed URLs for EU-hosted Cal.com accounts", () => {
    process.env.NEXT_PUBLIC_SITE_BOOKING_PROVIDER = "calcom";
    process.env.NEXT_PUBLIC_SITE_BOOKING_CALCOM_BASE =
      "https://cal.eu/digitaltableteur/30min";

    const result = resolveSiteBookingConfig();

    expect(result.configured).toBe(true);
    expect(result.embedUrl).toContain(
      "https://app.cal.eu/digitaltableteur/30min/embed",
    );
    expect(result.fallbackUrl).toBe("https://cal.eu/digitaltableteur/30min");
    expect(result.meetingLabel).toBe("30min");
    expect(result.calLink).toBe("digitaltableteur/30min");
    expect(result.calOrigin).toBe("https://cal.eu");
    expect(result.embedJsUrl).toBe("https://app.cal.eu/embed/embed.js");
    expect(
      isAllowedSiteBookingEmbedUrl(
        "https://app.cal.eu/digitaltableteur/30min/embed",
      ),
    ).toBe(true);
  });

  it("allowlists trusted booking iframe hosts", () => {
    expect(
      isAllowedSiteBookingEmbedUrl(
        "https://app.cal.com/digitaltableteur/discovery/embed",
      ),
    ).toBe(true);
    expect(isAllowedSiteBookingEmbedUrl("https://evil.example/booking")).toBe(
      false,
    );
  });
});
