import { describe, expect, it } from "vitest";
import {
  isUtilityString,
  UTILITY_TOKEN_RE,
} from "./check-dogfood-ratchet.mjs";

describe("dogfood ratchet utility detection", () => {
  // The variant prefix list covers the variants this repo uses. Others
  // (forced-colors:, print:, rtl:) are not recognised; nothing uses them today,
  // and adding unused variants would be speculative.
  describe("token regex recognises multi-hyphen utilities", () => {
    // These all failed before: the trailing segment excluded `-`, so matching
    // stopped at the second hyphen and the token was read as non-utility.
    it.each([
      "grid-cols-1",
      "md:grid-cols-2",
      "underline-offset-2",
      "overflow-x-auto",
      "bg-gradient-to-t",
      "inset-x-0",
      "space-y-1",
      "motion-reduce:group-hover:scale-100",
      "bg-black/60",
      "p-0.5",
    ])("%s is a utility token", (token) => {
      expect(UTILITY_TOKEN_RE.test(token)).toBe(true);
    });

    it.each(["Minified+gzip", "consumer", "satisfies", "contract"])(
      "%s is not a utility token",
      (token) => {
        expect(UTILITY_TOKEN_RE.test(token)).toBe(false);
      },
    );
  });

  describe("real class strings count", () => {
    it.each([
      "flex items-center gap-2",
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12",
      "absolute inset-0 z-10 m-auto h-fit w-fit",
      "text-xs underline underline-offset-2",
      "relative overflow-hidden",
    ])("counts %s", (value) => {
      expect(isUtilityString(value)).toBe(true);
    });

    // Interpolated template literals mix in one non-utility token; the ratio
    // has to stay low enough that these still count.
    it("counts a class string that interpolates a variable", () => {
      expect(isUtilityString("client-logo-marquee-container relative overflow-hidden ")).toBe(true);
    });
  });

  describe("prose does not count", () => {
    // The exact sentence that used to be filed as styling: "to" and "peer"
    // scored 2 hits under the old count-only rule.
    it("ignores a description containing 'to' and 'peer'", () => {
      expect(
        isUtilityString(
          "Minified+gzip bytes per exported component, in two honest modes: the package's own code (self) and the marginal cost to a consumer that satisfies the peer contract (withDeps).",
        ),
      ).toBe(false);
    });

    it.each([
      "You are Donny, Digitaltableteur's design systems intake guide. Your primary job is to qualify the lead.",
      "- Do not invent prices, discounts, or private contract terms. Public service packages only.",
    ])("ignores %s", (value) => {
      expect(isUtilityString(value)).toBe(false);
    });

    // Known residual, pinned so it is a decision rather than a surprise: a very
    // short phrase can sit exactly at the threshold. "to" and "origin" are both
    // utility heads, so this scores 2/4. Raising the ratio to exclude it costs
    // two real class strings (template literals that interpolate a variable),
    // which is the worse trade — a false negative hides debt, this only counts
    // one console message.
    it("still counts a four-word phrase that is exactly half utility heads", () => {
      expect(isUtilityString("Failed to parse origin")).toBe(true);
    });
  });

  describe("threshold edges", () => {
    it("needs at least two utility tokens", () => {
      expect(isUtilityString("flex")).toBe(false);
    });

    it("ignores an empty string", () => {
      expect(isUtilityString("   ")).toBe(false);
    });

    it("ignores two utility words buried in a long sentence", () => {
      expect(
        isUtilityString("the block was moved to the end of the sentence today"),
      ).toBe(false);
    });
  });
});
