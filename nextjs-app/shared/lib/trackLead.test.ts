import { afterEach, describe, expect, it, vi } from "vitest";

import { trackLead } from "./trackLead";

type TestWindow = Window & Record<string, unknown>;
const win = window as unknown as TestWindow;

describe("trackLead", () => {
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
});
