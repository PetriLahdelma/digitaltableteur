import { describe, expect, it } from "vitest";

import { checkUsage, usageFromProps, type RuleSource } from "./contract-rules";
import { executeValidateComponentUsage } from "./executors";
import { extractJsxUsages } from "./jsx-usage";

const KNOWN = new Set(["Button", "Card", "HeroSection"]);

describe("extractJsxUsages", () => {
  it("reads literal, boolean-shorthand, and expression props", () => {
    const [usage] = extractJsxUsages(
      'import { Button } from "@dt/Button";\n<Button icon="search" rounded size={"sm"} count={3} href={url} />',
      KNOWN,
    );
    expect(usage.component).toBe("Button");
    expect(usage.line).toBe(2);
    expect(usage.props).toEqual({
      icon: { kind: "literal", value: "search" },
      rounded: { kind: "literal", value: true },
      size: { kind: "literal", value: "sm" },
      count: { kind: "literal", value: 3 },
      href: { kind: "expression" },
    });
    expect(usage.hasChildren).toBe(false);
  });

  it("resolves aliased, package, and relative imports", () => {
    const usages = extractJsxUsages(
      [
        'import { Button as Btn } from "@digitaltableteur/react/actions";',
        'import Card from "../Card";',
        "<><Btn>Go</Btn><Card title=\"x\" /></>",
      ].join("\n"),
      KNOWN,
    );
    expect(usages.map((u) => u.component)).toEqual(["Button", "Card"]);
    expect(usages[0].hasChildren).toBe(true);
  });

  it("ignores same-named tags that are not design-system imports", () => {
    const usages = extractJsxUsages(
      'import { Button } from "some-other-lib";\n<Button icon="x" />',
      KNOWN,
      "file.tsx",
      { matchBareTags: true },
    );
    expect(usages).toEqual([]);
  });

  it("matches bare tags in import-free snippets only when asked", () => {
    expect(extractJsxUsages('<Button icon="x" />', KNOWN)).toEqual([]);
    expect(extractJsxUsages('<Button icon="x" />', KNOWN, "s.tsx", { matchBareTags: true })).toHaveLength(1);
  });

  it("records spreads and whitespace-only children", () => {
    const [usage] = extractJsxUsages(
      'import { Button } from "@dt/Button";\n<Button {...rest}>   </Button>',
      KNOWN,
    );
    expect(usage.hasSpread).toBe(true);
    expect(usage.hasChildren).toBe(false);
  });
});

const RULES: RuleSource = {
  propRelationships: [
    { kind: "mutuallyExclusive", props: ["value", "defaultValue"], reason: "pick one" },
  ],
  forbiddenCombos: [
    {
      id: "icon-only-needs-name",
      when: { icon: { present: true }, children: { absent: true } },
      requireAnyOf: ["accessibleName", "aria-label"],
      reason: "name it",
      severity: "error",
    },
    {
      id: "image-mode",
      when: { image: { present: true }, background: { oneOf: ["solid", "gradient"] } },
      forbid: ["image"],
      reason: "image mode only",
      severity: "error",
    },
  ],
  props: { onChange: { deprecated: true, deprecation: "Use onValueChange." } },
};

function check(props: Record<string, unknown>) {
  return checkUsage(usageFromProps("X", props), RULES);
}

describe("checkUsage", () => {
  it("flags an icon-only usage without an accessible name", () => {
    expect(check({ icon: "search" })).toEqual([
      expect.objectContaining({ rule: "icon-only-needs-name", severity: "error" }),
    ]);
  });

  it("passes when any required name prop is present, or children exist", () => {
    expect(check({ icon: "search", "aria-label": "Search" })).toEqual([]);
    expect(check({ icon: "search", children: "Search" })).toEqual([]);
  });

  it("skips absence-based rules when a spread could supply the prop", () => {
    const [usage] = extractJsxUsages(
      'import { Button } from "@dt/Button";\n<Button icon="x" {...rest} />',
      KNOWN,
    );
    expect(checkUsage(usage, RULES)).toEqual([]);
  });

  it("only fires oneOf/equals conditions on statically known literals", () => {
    expect(check({ image: "/a.jpg", background: "solid" })).toHaveLength(1);
    expect(check({ image: "/a.jpg", background: "image" })).toEqual([]);
    const [dynamic] = extractJsxUsages(
      'import { Button } from "@dt/Button";\n<Button image="/a.jpg" background={mode} />',
      KNOWN,
    );
    expect(checkUsage(dynamic, RULES)).toEqual([]);
  });

  it("reports mutually exclusive props and deprecated props", () => {
    const findings = check({ value: "a", defaultValue: "b", onChange: "fn" });
    expect(findings.map((f) => [f.rule, f.severity])).toEqual([
      ["mutuallyExclusive", "error"],
      ["deprecated", "warning"],
    ]);
  });
});

describe("validate_component_usage against the real manifest", () => {
  it("rejects a Card snippet that combines link with a footer", () => {
    const result = executeValidateComponentUsage({
      snippet: '<Card title="Case" link="/work" footerEnd={<span />} />',
    });
    const payload = result.structuredContent as {
      ok: boolean;
      contractFindings: Array<{ rule: string; line: number | null }>;
    };
    expect(payload.ok).toBe(false);
    expect(payload.contractFindings).toEqual([
      expect.objectContaining({ rule: "card-link-with-footer", line: 1 }),
    ]);
  });

  it("rejects an icon-only Button without an accessible name", () => {
    const result = executeValidateComponentUsage({ snippet: '<Button icon="search" />' });
    expect((result.structuredContent as { ok: boolean }).ok).toBe(false);
  });

  it("derives controlled/uncontrolled pairs from defaultX props", () => {
    const result = executeValidateComponentUsage({
      component: "Checkbox",
      props: { checked: true, defaultChecked: false },
    });
    expect((result.structuredContent as { ok: boolean }).ok).toBe(false);
  });
});
