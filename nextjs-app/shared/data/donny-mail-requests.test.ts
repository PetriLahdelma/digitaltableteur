import { describe, expect, it } from "vitest";
import {
  buildDonnyMailtoUrl,
  isAllowedDonnyMailtoUrl,
  resolveDonnyMailRequestType,
  DONNY_STUDIO_EMAIL,
} from "./donny-mail-requests";

describe("donny-mail-requests", () => {
  it("builds mailto URLs with subject and body", () => {
    const cvUrl = buildDonnyMailtoUrl("cv");
    expect(cvUrl.startsWith(`mailto:${DONNY_STUDIO_EMAIL}?`)).toBe(true);
    const cvParams = new URLSearchParams(cvUrl.split("?")[1]);
    expect(cvParams.get("subject")).toBe("CV request — Digitaltableteur");
    expect(cvParams.get("body")).toContain("I would like to request Petri Lahdelma's CV.");

    const portfolioUrl = buildDonnyMailtoUrl("portfolio");
    const portfolioParams = new URLSearchParams(portfolioUrl.split("?")[1]);
    expect(portfolioParams.get("subject")).toBe(
      "Portfolio request — Digitaltableteur",
    );
    expect(portfolioParams.get("body")).toContain(
      "I would like to request a curated portfolio",
    );
  });

  it("validates allowed mailto URLs", () => {
    expect(isAllowedDonnyMailtoUrl(buildDonnyMailtoUrl("cv"))).toBe(true);
    expect(isAllowedDonnyMailtoUrl("mailto:other@example.com?subject=x")).toBe(
      false,
    );
  });

  it("resolves natural-language mail request types", () => {
    expect(resolveDonnyMailRequestType("request a cv")).toBe("cv");
    expect(resolveDonnyMailRequestType("Request a CV")).toBe("cv");
    expect(resolveDonnyMailRequestType("request a portfolio")).toBe("portfolio");
    expect(resolveDonnyMailRequestType("send me a portfolio")).toBe("portfolio");
    expect(resolveDonnyMailRequestType("pricing")).toBeNull();
  });
});
