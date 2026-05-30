import { describe, expect, it, vi } from "vitest";
import {
  applyDonnyHighlightAttributes,
  clearDonnyHighlightAttributes,
  createDonnyAnnotationId,
  getVisibleDonnyTargetIds,
  isElementInViewport,
  normalizeDonnyPath,
  resolveDonnyTargetWithFallback,
  resolveHighlightMode,
  waitForDonnyTarget,
} from "./donnyActionUtils";
import { dispatchDonnyContactPrefill, DONNY_PREFILL_CONTACT_EVENT } from "./donnyContactPrefill";

describe("donnyActionUtils", () => {
  it("normalizes paths without query or hash", () => {
    expect(normalizeDonnyPath("/pricing?pkg=ux")).toBe("/pricing");
    expect(normalizeDonnyPath("/work#proof")).toBe("/work");
  });

  it("resolves highlight mode against registry allow-list", () => {
    expect(resolveHighlightMode("contact.form", "focus")).toBe("focus");
    expect(resolveHighlightMode("contact.form", "pulse")).toBe("focus");
  });

  it("applies and clears highlight data attributes", () => {
    const element = document.createElement("section");
    applyDonnyHighlightAttributes(element, "underline", "donny-test");
    expect(element.getAttribute("data-donny-active")).toBe("true");
    expect(element.getAttribute("data-donny-highlight")).toBe("underline");
    clearDonnyHighlightAttributes(element);
    expect(element.hasAttribute("data-donny-active")).toBe(false);
  });

  it("creates unique annotation ids", () => {
    const first = createDonnyAnnotationId();
    const second = createDonnyAnnotationId();
    expect(first).not.toBe(second);
    expect(first.startsWith("donny-annotation-")).toBe(true);
  });

  it("waits for a target element with bounded retries", async () => {
    vi.useFakeTimers();
    const selector = '[data-donny-target="contact.form"]';
    const promise = waitForDonnyTarget(selector, {
      maxAttempts: 3,
      intervalMs: 10,
    });

    vi.advanceTimersByTime(15);
    const element = document.createElement("form");
    element.setAttribute("data-donny-target", "contact.form");
    document.body.appendChild(element);

    vi.advanceTimersByTime(10);
    await expect(promise).resolves.toBe(element);
    document.body.removeChild(element);
    vi.useRealTimers();
  });

  it("detects viewport visibility", () => {
    const element = document.createElement("div");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 10,
      left: 10,
      bottom: 110,
      right: 110,
      width: 100,
      height: 100,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    });
    expect(isElementInViewport(element)).toBe(true);
  });

  it("collects visible registry targets", () => {
    const element = document.createElement("div");
    element.setAttribute("data-donny-target", "contact.form");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      top: 10,
      left: 10,
      bottom: 110,
      right: 110,
      width: 100,
      height: 100,
      x: 10,
      y: 10,
      toJSON: () => ({}),
    });
    document.body.appendChild(element);
    expect(getVisibleDonnyTargetIds()).toContain("contact.form");
    document.body.removeChild(element);
  });

  it("resolves fallback targets from registry", () => {
    const resolved = resolveDonnyTargetWithFallback("pricing.package.designSystemLiftOff");
    expect(resolved?.route).toBe("/pricing");
    expect(resolved?.selector).toContain("pricing.package.designSystemLiftOff");
  });
});

describe("donnyContactPrefill", () => {
  it("dispatches prefill custom event", () => {
    const handler = vi.fn();
    window.addEventListener(DONNY_PREFILL_CONTACT_EVENT, handler);

    dispatchDonnyContactPrefill({
      projectType: "ds-audit",
      message: "Interested in design system lift-off",
    });

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(DONNY_PREFILL_CONTACT_EVENT, handler);
  });
});
