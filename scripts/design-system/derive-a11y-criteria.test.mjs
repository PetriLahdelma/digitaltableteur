import { describe, expect, it } from "vitest";

import { deriveA11yCriteria } from "./derive-a11y-criteria.mjs";

const contract = {
  status: "beta",
  a11y: {
    keyboard: ["Enter", "Space"],
    ariaRequirements: ["role=button"],
    announces: "polite",
    motion: true,
    reducedMotion: true,
  },
};

describe("WCAG 2.2 / EN 301 549 mapping", () => {
  const byId = Object.fromEntries(deriveA11yCriteria(contract).map((c) => [c.id, c]));

  it("maps the keyboard contract to 2.1.1 and 2.1.2 with EN 301 549 clause numbers", () => {
    expect(byId["keyboard-contract"].wcag).toEqual([
      { sc: "2.1.1", name: "Keyboard", level: "A", en301549: "9.2.1.1", coverage: "partial" },
      { sc: "2.1.2", name: "No Keyboard Trap", level: "A", en301549: "9.2.1.2", coverage: "partial" },
    ]);
  });

  it("maps live regions to 4.1.3 Status Messages", () => {
    expect(byId["live-region"].wcag.map((w) => w.sc)).toEqual(["4.1.3"]);
  });

  it("never claims more than partial coverage, and leaves beyond-WCAG checks unmapped", () => {
    for (const criterion of Object.values(byId)) {
      for (const entry of criterion.wcag ?? []) expect(entry.coverage).toBe("partial");
    }
    expect(byId["forced-colors-real-browser"].wcag).toBeUndefined();
  });
});
