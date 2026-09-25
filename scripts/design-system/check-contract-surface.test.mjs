import { describe, expect, it } from "vitest";

import {
  buildSurface,
  deprecationsWithoutWarning,
  bumpBetween,
  bumpFor,
  diffSurfaces,
  strongest,
} from "./check-contract-surface.mjs";

function manifestWith(props, contract = {}) {
  return {
    components: [
      {
        name: "Button",
        contract: { element: "button", slots: [], subParts: [], a11y: { keyboard: ["Enter"] }, ...contract },
        agent: { props },
      },
      { name: "Internal", contract: {}, agent: { props: {} } },
    ],
  };
}

const base = buildSurface(
  manifestWith({
    variant: { optional: true, type: "union", values: ["primary", "secondary"] },
    href: { optional: true, type: "string" },
  }),
  ["Button"],
);

describe("buildSurface", () => {
  it("keeps only exported components", () => {
    expect(Object.keys(base)).toEqual(["Button"]);
  });
});

describe("diffSurfaces", () => {
  it("is empty for an unchanged surface", () => {
    expect(diffSurfaces(base, base)).toEqual([]);
  });

  it("classifies removals and narrowing as breaking", () => {
    const next = buildSurface(
      manifestWith(
        { variant: { optional: false, type: "union", values: ["primary"] } },
        { a11y: { keyboard: [] } },
      ),
      ["Button"],
    );
    const details = diffSurfaces(base, next).map((c) => `${c.level}: ${c.detail}`);
    expect(details).toEqual(
      expect.arrayContaining([
        "breaking: prop `href` removed",
        "breaking: prop `variant` became required",
        'breaking: prop `variant` dropped value "secondary"',
        'breaking: keyboard lost "Enter"',
      ]),
    );
  });

  it("classifies optional additions as additive and new required props as breaking", () => {
    const next = buildSurface(
      manifestWith({
        variant: { optional: true, type: "union", values: ["primary", "secondary", "ghost"] },
        href: { optional: true, type: "string" },
        size: { optional: true, type: "union", values: ["sm", "md"] },
        label: { optional: false, type: "string" },
      }),
      ["Button"],
    );
    const levels = Object.fromEntries(diffSurfaces(base, next).map((c) => [c.detail, c.level]));
    expect(levels['prop `variant` added value "ghost"']).toBe("additive");
    expect(levels["prop `size` added"]).toBe("additive");
    expect(levels["required prop `label` added"]).toBe("breaking");
  });

  it("flags a removed component as breaking", () => {
    expect(diffSurfaces(base, {})).toEqual([
      { component: "Button", level: "breaking", detail: "component removed from the public API" },
    ]);
  });
});

describe("semver helpers", () => {
  it("maps breaking changes to minor under 0.x and major from 1.0", () => {
    expect(bumpFor("breaking", "0.1.25")).toBe("minor");
    expect(bumpFor("breaking", "1.2.0")).toBe("major");
    expect(bumpFor("additive", "0.1.25")).toBe("patch");
    expect(bumpFor("additive", "1.2.0")).toBe("minor");
  });

  it("measures the bump taken between versions", () => {
    expect(bumpBetween("0.1.25", "0.1.26")).toBe("patch");
    expect(bumpBetween("0.1.25", "0.2.0")).toBe("minor");
    expect(bumpBetween("0.1.25", "1.0.0")).toBe("major");
    expect(bumpBetween("0.1.25", "0.1.25")).toBe("none");
  });

  it("keeps the strongest pending bump", () => {
    expect(strongest("none", "patch", "minor", "patch")).toBe("minor");
  });
});

describe("deprecationsWithoutWarning", () => {
  const surface = {
    TextInput: { props: { onChange: { optional: true, type: "fn", deprecated: true } } },
    Card: { props: { extra: { optional: true, type: "node", deprecated: true } } },
  };
  it("accepts a deprecation that warns via warnPropRename and flags one that does not", () => {
    const sources = {
      TextInput: 'if (onChange) warnPropRename("TextInput", "onChange", "onValueChange");',
      Card: "const header = headerEnd ?? extra;",
    };
    expect(deprecationsWithoutWarning(surface, (name) => sources[name])).toEqual(["Card.extra"]);
  });
});
