import { describe, expect, it } from "vitest";

import {
  executeFindComponentForIntent,
  executeValidateComponentUsage,
} from "./executors";
import { rankComponentsForIntent } from "./rank-intent";
import type { ManifestComponentEntry } from "./types";

const FIXTURE_COMPONENTS: ManifestComponentEntry[] = [
  {
    name: "AlertBanner",
    contract: {
      description: "Inline alert for info, warning, success, and error feedback.",
      status: "beta",
      tier: "molecule",
    },
    usage: { productionImportCount: 2, importCount: 4 },
    agent: {
      composesWith: ["Button", "Icon"],
      intent: "Persistent page-level status",
    },
  },
  {
    name: "Button",
    contract: {
      description: "Primary interaction control",
      status: "beta",
      tier: "molecule",
    },
    usage: { productionImportCount: 12, importCount: 20 },
    agent: { variants: { variant: { values: ["primary", "secondary"] } } },
  },
];

describe("rankComponentsForIntent", () => {
  it("ranks AlertBanner above Button for warning banner query", () => {
    const ranked = rankComponentsForIntent(
      "dismissible warning banner",
      FIXTURE_COMPONENTS,
      4,
    );
    expect(ranked[0]?.name).toBe("AlertBanner");
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0);
  });
});

describe("executeValidateComponentUsage", () => {
  it("flags raw button in snippet", () => {
    const result = executeValidateComponentUsage({
      snippet: '<button type="button">Retry</button>',
    });
    const text = result.content[0].text;
    const parsed = JSON.parse(text) as { ok: boolean; violationCount: number };
    expect(parsed.ok).toBe(false);
    expect(parsed.violationCount).toBeGreaterThan(0);
  });

  it("passes clean @dt snippet", () => {
    const result = executeValidateComponentUsage({
      snippet: 'import { Button } from "@dt/Button";\n<Button>OK</Button>',
    });
    const parsed = JSON.parse(result.content[0].text) as { ok: boolean };
    expect(parsed.ok).toBe(true);
  });
});

describe("executeFindComponentForIntent", () => {
  it("returns error when manifest is missing", () => {
    const prev = process.cwd();
    process.chdir("/tmp");
    const result = executeFindComponentForIntent({ query: "banner" });
    process.chdir(prev);
    expect(result.isError).toBe(true);
  });
});
