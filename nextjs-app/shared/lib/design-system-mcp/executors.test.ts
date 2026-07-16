import { describe, expect, it } from "vitest";

import {
  executeFindComponentForIntent,
  executeSuggestPatternForLayout,
  executeValidateComponentUsage,
} from "./executors";
import { rankComponentsForIntent } from "./rank-intent";
import { rankPatternsForIntent } from "./pattern-composition";
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

  it("rejects mutually exclusive props from the generated component contract", () => {
    const result = executeValidateComponentUsage({
      component: "Button",
      props: { href: "/work", submits: true },
    });
    const parsed = JSON.parse(result.content[0].text) as {
      ok: boolean;
      contractFindings: Array<{ rule: string }>;
    };
    expect(parsed.ok).toBe(false);
    expect(parsed.contractFindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "mutuallyExclusive" }),
      ]),
    );
  });

  it("rejects dependent props when their required discriminator is absent", () => {
    const result = executeValidateComponentUsage({
      component: "Button",
      props: { target: "_blank" },
    });
    const parsed = JSON.parse(result.content[0].text) as {
      ok: boolean;
      contractFindings: Array<{ rule: string; props: string[] }>;
    };
    expect(parsed.ok).toBe(false);
    expect(parsed.contractFindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "requires", props: ["target", "href"] }),
      ]),
    );
  });

  it("accepts a valid structured prop combination", () => {
    const result = executeValidateComponentUsage({
      component: "Button",
      props: { href: "/work", target: "_blank" },
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

describe("rankPatternsForIntent", () => {
  it("ranks CTASection for marketing CTA query", () => {
    const ranked = rankPatternsForIntent(
      "marketing call to action band",
      [
        {
          name: "CTASection",
          publicImport: "@dt/CTASection",
          useWhen: ["marketing call-to-action band"],
          status: "beta",
        },
        {
          name: "Header",
          publicImport: "@dt/Header",
          useWhen: ["site header navigation"],
          status: "beta",
        },
      ],
      3,
    );
    expect(ranked[0]?.name).toBe("CTASection");
  });

  it("boosts inverse-aware patterns and surfaces constraints for dark CTA queries", () => {
    const ranked = rankPatternsForIntent(
      "inverse background CTA on dark band",
      [
        {
          name: "CTASection",
          publicImport: "@dt/CTASection",
          useWhen: ["inverse or primary background CTA block"],
          avoidWhen: [
            "replacing shadcn CTA buttons with @dt/Button without variant parity review",
          ],
          variantNotes: {
            inverseBackground:
              "Production CTASection uses outline on dark bands — contrast check required.",
          },
          status: "beta",
        },
        {
          name: "Header",
          publicImport: "@dt/Header",
          useWhen: ["site header navigation"],
          status: "beta",
        },
      ],
      2,
    );
    expect(ranked[0]?.name).toBe("CTASection");
    expect(ranked[0]?.surfaceConstraints?.length).toBeGreaterThan(0);
  });
});

describe("executeSuggestPatternForLayout", () => {
  it("returns matches for layout query", () => {
    const result = executeSuggestPatternForLayout({
      query: "full bleed homepage hero",
    });
    const parsed = JSON.parse(result.content[0].text) as {
      matches: Array<{ name: string }>;
    };
    expect(parsed.matches[0]?.name).toBe("HeroSection");
  });

  it("flags inverseSurface for dark-band layout queries", () => {
    const result = executeSuggestPatternForLayout({
      query: "inverse background CTA on dark band",
    });
    const parsed = JSON.parse(result.content[0].text) as {
      inverseSurface: boolean;
      matches: Array<{ name: string; surfaceConstraints?: string[] }>;
    };
    expect(parsed.inverseSurface).toBe(true);
    expect(parsed.matches[0]?.name).toBe("CTASection");
    expect(parsed.matches[0]?.surfaceConstraints?.length).toBeGreaterThan(0);
  });
});
