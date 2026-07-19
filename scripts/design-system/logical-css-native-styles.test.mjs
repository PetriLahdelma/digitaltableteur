import { describe, expect, it } from "vitest";
import {
  extractNativeStyleTemplates,
  findLogicalCssContractErrors,
  lintLogicalCss,
  lintNativeCss,
  replaceNativeStyleTemplates,
} from "./logical-css-native-styles.mjs";

const source = `
const label = \`not CSS\`;
const styles = \`
  .panel {
    width: 50vw;
    text-align: left;
  }
\`;
`;

describe("native logical CSS extraction", () => {
  it("finds only the static styles template and preserves source offsets", () => {
    const templates = extractNativeStyleTemplates(source, "panel.ts");

    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      css: expect.stringContaining("width: 50vw"),
      file: "panel.ts",
    });
    expect(source.slice(templates[0].start, templates[0].end)).toBe(
      templates[0].css,
    );
  });

  it("discovers named style constants and rejects templates it cannot inspect", () => {
    expect(
      extractNativeStyleTemplates("const cardStyles = `.card {}`;", "card.ts"),
    ).toHaveLength(1);
    expect(() =>
      extractNativeStyleTemplates(
        "const cardStyles = `.card { color: ${tone}; }`;",
        "card.ts",
      ),
    ).toThrow(/static, untagged template literal/);
    expect(() =>
      extractNativeStyleTemplates(
        "const cardStyles = css`.card { color: red; }`;",
        "card.ts",
      ),
    ).toThrow(/static, untagged template literal/);
  });

  it("uses the upstream plugin to report and autofix logical CSS drift", async () => {
    const [template] = extractNativeStyleTemplates(source, "panel.ts");
    const audit = await lintLogicalCss(template, { fix: false });

    expect(new Set(audit.warnings.map((warning) => warning.rule))).toEqual(
      new Set([
        "logical-css/require-logical-keywords",
        "logical-css/require-logical-properties",
        "logical-css/require-logical-units",
      ]),
    );

    const fixed = await lintLogicalCss(template, { fix: true });
    const nextSource = replaceNativeStyleTemplates(source, [
      { ...template, css: fixed.css },
    ]);

    expect(nextSource).toContain("inline-size: 50vi");
    expect(nextSource).toContain("text-align: start");
    expect(nextSource).toContain("const label = `not CSS`");
  });

  it("reports rhythm drift without rewriting visual values", async () => {
    const rhythmSource = `const styles = \`.panel { padding-inline: 13px; }\`;`;
    const [template] = extractNativeStyleTemplates(rhythmSource, "panel.ts");

    const result = await lintNativeCss(template);

    expect(result.css).toBe(template.css);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rule: "rhythmguard/use-scale" }),
      ]),
    );
  });

  it("preserves HTML examples inside CSS comments during autofix", async () => {
    const template = {
      css: "/** <!-- content --> */\n.panel { width: 100%; }",
      file: "example.css",
    };

    const result = await lintLogicalCss(template, { fix: true });

    expect(result.css).toContain("<!-- content -->");
    expect(result.css).not.toContain("\\3c");
    expect(result.css).toContain("inline-size: 100%");
  });

  it("requires compatibility fallbacks in both axes", () => {
    expect(
      findLogicalCssContractErrors(
        ".panel { overflow-x: auto; overflow-inline: auto; resize: vertical; resize: block; } .handle { resize: horizontal; resize: inline; }",
        "panel.css",
      ),
    ).toEqual([]);
    expect(
      findLogicalCssContractErrors(
        ".panel { resize: inline; } .handle { resize: horizontal; }",
        "panel.css",
      ).map(({ rule }) => rule),
    ).toEqual([
      "digitaltableteur/require-logical-fallback-pair",
      "digitaltableteur/require-logical-fallback-pair",
    ]);
  });

  it("rejects physical translations paired with logical midpoint positioning", () => {
    expect(
      findLogicalCssContractErrors(
        ".inline { inset-inline-start: 50%; translate: -50% 0; } .block { inset-block-start: 50%; transform: translate(0, -60%); }",
        "panel.css",
      ).map(({ text }) => text),
    ).toEqual([
      "Logical 50% inset cannot be centered with a physical negative inline translation",
      "Logical 50% inset cannot be centered with a physical negative block translation",
    ]);
  });

  it("allows only paired physical midpoint exceptions", () => {
    expect(
      findLogicalCssContractErrors(
        ".inline { left: 50%; transform: translateX(-50%); } .block { top: 50%; translate: 0 -50%; }",
        "panel.css",
      ),
    ).toEqual([]);
    expect(
      findLogicalCssContractErrors(
        ".left { left: 1rem; } .top { top: 50%; }",
        "panel.css",
      ).map(({ rule }) => rule),
    ).toEqual([
      "digitaltableteur/no-unpaired-physical-centering",
      "digitaltableteur/no-unpaired-physical-centering",
    ]);
  });

  it("normalizes CSS identifier casing and validates overriding duplicates", () => {
    expect(
      findLogicalCssContractErrors(
        ".inline { LEFT: 50%; transform: translatex(-50%); } .block { TOP: 50%; transform: translatey(-50%); }",
        "panel.css",
      ),
    ).toEqual([]);
    expect(
      findLogicalCssContractErrors(
        ".inline { left: 50%; transform: translateX(-50%); LEFT: 1rem; } .block { top: 50%; transform: translateY(-50%); TOP: 2rem; }",
        "panel.css",
      ).map(({ rule }) => rule),
    ).toEqual([
      "digitaltableteur/no-unpaired-physical-centering",
      "digitaltableteur/no-unpaired-physical-centering",
    ]);
  });

  it("uses effective translations after cascade overrides", () => {
    expect(
      findLogicalCssContractErrors(
        ".inline { left: 50%; transform: translateX(-50%); transform: none; } .block { top: 50%; translate: 0 -50%; translate: none; }",
        "panel.css",
      ).map(({ rule }) => rule),
    ).toEqual([
      "digitaltableteur/no-unpaired-physical-centering",
      "digitaltableteur/no-unpaired-physical-centering",
    ]);
    expect(
      findLogicalCssContractErrors(
        ".inline { left: 50%; transform: translateX(-50%) !important; transform: none; } .block { top: 50%; translate: 0 -50% !important; translate: none; }",
        "panel.css",
      ),
    ).toEqual([]);
  });
});
