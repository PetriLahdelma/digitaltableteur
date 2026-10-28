import { afterEach, describe, expect, it, vi } from "vitest";

import { trackEvent, trackLead } from "./analytics";

type TestWindow = Window & Record<string, unknown>;
const win = window as unknown as TestWindow;

describe("analytics events", () => {
  afterEach(() => {
    delete win.gtag;
    delete win["ga-disable-G-TEST"];
  });

  it("sends generate_lead with only the lead source", () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackLead("contact_form");
    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", { lead_source: "contact_form" });
  });

  it("does nothing when analytics never loaded", () => {
    expect(() => trackLead("chat")).not.toThrow();
  });

  it("does nothing after consent was withdrawn", () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    win["ga-disable-G-TEST"] = true;
    trackLead("chat");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("adds the engagement package when there is one", () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackLead("contact_form", { engagementPackage: "design-system-audit" });
    expect(gtag).toHaveBeenCalledWith("event", "generate_lead", {
      lead_source: "contact_form",
      engagement_package: "design-system-audit",
    });
  });

  it("sends a plain event", () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackEvent("chat_start");
    expect(gtag).toHaveBeenCalledWith("event", "chat_start", {});
  });
});
