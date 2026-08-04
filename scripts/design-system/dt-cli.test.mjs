import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  affected,
  applyUpgradeToSource,
  attributeSpan,
  classifyContractDiff,
  component,
  compose,
  diff,
  doctor,
  DtCliError,
  example,
  manifest,
  planComponentUpgrade,
  search,
  upgrade,
  validate,
  verify,
} from "../../packages/cli/src/api.mjs";

const execFileAsync = promisify(execFile);

describe("@digitaltableteur/cli API", () => {
  it("searches the generated registry by interface intent", async () => {
    const result = await search("primary action");
    expect(result.type).toBe("search");
    expect(result.data.results[0].name).toBe("Button");
  });

  it("returns a narrowed component section", async () => {
    const result = await component("button", { section: "theming" });
    expect(result.type).toBe("component.detail");
    expect(result.data.name).toBe("Button");
    expect(result.data.tokens).toBeTruthy();
    expect(result.data.props).toBeUndefined();
  });

  it("returns runnable example sources", async () => {
    const result = await example("Button");
    expect(result.type).toBe("component.examples");
    expect(result.data.examples.length).toBeGreaterThan(0);
    expect(result.data.examples[0].source).toBeTruthy();
  });

  it("suggests related components from contract relationships", async () => {
    const result = await compose("warning notification");
    expect(result.type).toBe("composition.suggestions");
    expect(result.data.seeds.length).toBeGreaterThan(0);
  });

  it("publishes a self-describing, versioned capability manifest", async () => {
    const result = await manifest();
    expect(result.type).toBe("manifest");
    expect(result.data.apiVersion).toBe(1);
    expect(result.data.commands.map(({ name }) => name)).toEqual([
      "search",
      "component",
      "example",
      "compose",
      "manifest",
      "doctor",
      "diff",
      "affected",
      "validate",
      "upgrade",
      "verify",
    ]);
  });

  it("diagnoses registry parity", async () => {
    const result = await doctor();
    expect(result.type).toBe("doctor");
    expect(result.data.healthy).toBe(true);
  });

  it("uses a stable error code and suggestions for unknown components", async () => {
    await expect(component("Buttn")).rejects.toMatchObject({
      code: "ERR_UNKNOWN_COMPONENT",
    });
    try {
      await component("Buttn");
    } catch (error) {
      expect(error).toBeInstanceOf(DtCliError);
      expect(error.suggestions.length).toBeGreaterThan(0);
    }
  });

  it("provides conventional command-line help", async () => {
    const { stdout } = await execFileAsync(process.execPath, [
      "packages/cli/src/cli.mjs",
      "--help",
    ]);
    expect(stdout).toContain("Usage: dt <command>");
    expect(stdout).toContain("search");
    expect(stdout).toContain("--json");
  });

  it("classifies contract changes with per-change severity and semver rollup", () => {
    const before = {
      status: "beta",
      props: {
        size: { optional: true, type: '"sm" | "md" | "lg"', default: "md" },
        label: { optional: false, type: "string" },
        tone: { optional: true, type: '"info" | "error"' },
      },
      a11y: { keyboard: ["Tab", "Enter"], ariaRequirements: ["role=button"] },
      composesWith: ["Icon"],
      slots: ["icon"],
    };
    const after = {
      status: "beta",
      props: {
        size: { optional: true, type: '"sm" | "md"', default: "sm" },
        label: { optional: true, type: "string" },
        variant: { optional: false, type: '"solid" | "ghost"' },
      },
      a11y: { keyboard: ["Tab"], ariaRequirements: ["role=button"] },
      composesWith: ["Icon", "Badge"],
      slots: ["icon"],
    };
    const report = classifyContractDiff("Widget", before, after);
    expect(report.semver).toBe("major");
    const kinds = report.changes.map((change) => change.kind);
    expect(kinds).toContain("prop-removed"); // tone
    expect(kinds).toContain("prop-added"); // variant (required -> major)
    expect(kinds).toContain("prop-values-removed"); // size lost "lg"
    expect(kinds).toContain("prop-default-changed"); // md -> sm
    expect(kinds).toContain("prop-now-optional"); // label
    expect(kinds).toContain("a11y-keyboard-removed"); // Enter
    expect(kinds).toContain("composesWith-changed");
    const valueRemoval = report.changes.find(
      (change) => change.kind === "prop-values-removed",
    );
    expect(valueRemoval.severity).toBe("major");
  });

  it("reports an empty diff for identical refs", { timeout: 30000 }, async () => {
    const result = await diff(undefined, { from: "HEAD", to: "HEAD" });
    expect(result.type).toBe("diff.report");
    expect(result.data.componentCount).toBe(0);
    expect(result.data.semverRecommendation).toBe("none");
  });

  it("maps a component to its consumers, composition dependents, and pages", async () => {
    const result = await affected(["DataTable"]);
    expect(result.type).toBe("affected.report");
    const [target] = result.data.targets;
    expect(target.name).toBe("DataTable");
    expect(target.composedBy).toContain("Table");
    expect(
      result.data.files.some((file) => file.includes("GoldenIntentsTable")),
    ).toBe(true);
  });

  describe("validate", () => {
    let fixtureDir;

    beforeAll(async () => {
      fixtureDir = await mkdtemp(join(tmpdir(), "dt-validate-"));
      await mkdir(join(fixtureDir, "node_modules"), { recursive: true });
      await writeFile(
        join(fixtureDir, "node_modules", "Ignored.tsx"),
        `import Badge from "@dt/Badge";\nexport const X = () => <Badge variant="nope" />;\n`,
      );
      await writeFile(
        join(fixtureDir, "Fixture.tsx"),
        [
          `import Badge from "@dt/Badge";`,
          `import DataTable from "@dt/DataTable";`,
          `import Phantom from "@dt/Phantom";`,
          `import Hero from "@dt/Hero";`,
          `declare const rows: never[]; declare const cols: never[]; declare const rest: object;`,
          `export function Fixture() {`,
          `  return (`,
          `    <div>`,
          `      <Badge variant="primary">ok</Badge>`,
          `      <Badge variant="tertiary">bad enum</Badge>`,
          `      <Badge frobnicate="yes">unknown prop</Badge>`,
          `      <DataTable data={rows} columns={cols} getRowId={(row) => row.id} />`,
          `      <DataTable {...rest} />`,
          `      <Hero title="legacy" />`,
          `      <Phantom />`,
          `    </div>`,
          `  );`,
          `}`,
          ``,
        ].join("\n"),
      );
    });

    afterAll(async () => {
      await rm(fixtureDir, { recursive: true, force: true });
    });

    it("checks consumer usage against the installed contract manifest", async () => {
      const result = await validate([], { path: fixtureDir });
      expect(result.type).toBe("validate.report");
      expect(result.data.clean).toBe(false);
      const kinds = result.data.findings.map((finding) => finding.kind);

      expect(kinds).toContain("unknown-component"); // Phantom
      expect(kinds).toContain("invalid-enum-value"); // Badge variant="tertiary"
      expect(kinds).toContain("unknown-prop"); // Badge frobnicate
      expect(kinds).toContain("missing-required-prop"); // DataTable caption
      expect(kinds).toContain("deprecated-component"); // Hero

      const enumFinding = result.data.findings.find(
        (finding) => finding.kind === "invalid-enum-value",
      );
      expect(enumFinding.severity).toBe("error");
      expect(enumFinding.value).toBe("tertiary");
      const requiredFinding = result.data.findings.find(
        (finding) => finding.kind === "missing-required-prop",
      );
      expect(requiredFinding.prop).toBe("caption");
      // The spread DataTable bails out of presence checks and says so.
      expect(result.data.note).toContain("spread");
      // node_modules content is never scanned.
      expect(
        result.data.findings.every(
          (finding) => !finding.file.includes("node_modules"),
        ),
      ).toBe(true);
      // A valid literal produces no enum finding.
      expect(
        result.data.findings.filter(
          (finding) => finding.kind === "invalid-enum-value",
        ),
      ).toHaveLength(1);
    });

    it("narrows to named components and validates the filter", async () => {
      const result = await validate(["badge"], { path: fixtureDir });
      expect(result.data.filter).toEqual(["Badge"]);
      expect(
        result.data.findings.every(
          (finding) => finding.component === "Badge",
        ),
      ).toBe(true);
      await expect(validate(["Buttn"], { path: fixtureDir })).rejects.toMatchObject(
        { code: "ERR_UNKNOWN_COMPONENT" },
      );
    });

    it("exits non-zero from the CLI when contract violations exist", async () => {
      await expect(
        execFileAsync(process.execPath, [
          "packages/cli/src/cli.mjs",
          "validate",
          "--path",
          fixtureDir,
        ]),
      ).rejects.toMatchObject({ code: 2 });
    });
  });

  describe("upgrade", () => {
    const beforeContract = {
      status: "beta",
      props: {
        tone: { optional: true, type: '"info" | "error"' },
        size: { optional: true, type: '"sm" | "md" | "lg"', default: "md" },
        dense: { optional: true, type: "boolean" },
      },
    };
    const afterContract = {
      status: "beta",
      props: {
        intent: { optional: true, type: '"info" | "error"' },
        size: { optional: true, type: '"sm" | "md" | "lg"', default: "sm" },
        dense: { optional: true, type: "boolean" },
      },
    };

    it("finds attribute spans at expression depth 0 only", () => {
      const region = ` label={render({ size: "x" })} size="md" onClick={() => size()}`;
      const span = attributeSpan(region, "size");
      expect(region.slice(span.nameStart, span.nameEnd)).toBe("size");
      expect(region.slice(span.start, span.end)).toBe(` size="md"`);
      expect(attributeSpan(region, "missing")).toBeNull();
    });

    it("plans renames conservatively and pins changed defaults", () => {
      const report = classifyContractDiff(
        "Widget",
        beforeContract,
        afterContract,
      );
      const plan = planComponentUpgrade(report);
      expect(plan.actions.renames).toEqual([{ from: "tone", to: "intent" }]);
      expect(plan.actions.removals).toEqual([]);
      expect(plan.actions.defaults).toEqual([
        { prop: "size", attribute: `size="md"` },
      ]);
    });

    it("rewrites usages idempotently", () => {
      const report = classifyContractDiff(
        "Widget",
        beforeContract,
        afterContract,
      );
      const plans = new Map([["Widget", planComponentUpgrade(report)]]);
      const locals = new Map([["Widget", "Widget"]]);
      const source = [
        `const a = <Widget tone="error" size="lg" />;`,
        `const b = <Widget dense />;`,
        `const c = <Widget {...rest} />;`,
      ].join("\n");
      const first = applyUpgradeToSource(source, locals, plans);
      expect(first.output).toContain(`<Widget intent="error" size="lg" />`);
      // The omitted-size usage gets the previous default pinned; the
      // spread usage is left alone.
      expect(first.output).toContain(`<Widget size="md" dense />`);
      expect(first.output).toContain(`<Widget {...rest} />`);
      const second = applyUpgradeToSource(first.output, locals, plans);
      expect(second.edits).toHaveLength(0);
      expect(second.output).toBe(first.output);
    });

    it("routes judgment calls to manual items instead of guessing", () => {
      const report = classifyContractDiff(
        "Widget",
        {
          status: "beta",
          props: {
            size: { optional: true, type: '"sm" | "md" | "lg"' },
            label: { optional: true, type: "string" },
          },
        },
        {
          status: "beta",
          props: {
            size: { optional: true, type: '"sm" | "md"' },
            label: { optional: false, type: "string" },
          },
        },
      );
      const plan = planComponentUpgrade(report);
      const plans = new Map([["Widget", plan]]);
      const locals = new Map([["Widget", "Widget"]]);
      const source = [
        `const a = <Widget size="lg" label="ok" />;`,
        `const b = <Widget size="sm" />;`,
      ].join("\n");
      const result = applyUpgradeToSource(source, locals, plans);
      expect(result.edits).toHaveLength(0);
      const kinds = result.manual.map((item) => item.kind);
      expect(kinds).toContain("prop-values-removed"); // size="lg" in use
      expect(kinds).toContain("prop-now-required"); // label missing on b
      expect(result.manual).toHaveLength(2);
    });

    it("reports an empty upgrade for identical refs", { timeout: 30000 }, async () => {
      const result = await upgrade([], { from: "HEAD", to: "HEAD" });
      expect(result.type).toBe("upgrade.report");
      expect(result.data.dryRun).toBe(true);
      expect(result.data.summary.edits).toBe(0);
      expect(result.data.componentsPlanned).toEqual([]);
    });
  });

  describe("verify", () => {
    let cleanDir;
    let brokenDir;

    beforeAll(async () => {
      cleanDir = await mkdtemp(join(tmpdir(), "dt-verify-clean-"));
      brokenDir = await mkdtemp(join(tmpdir(), "dt-verify-broken-"));
      await writeFile(
        join(cleanDir, "Ok.tsx"),
        `import Badge from "@dt/Badge";\nexport const Ok = () => <Badge variant="primary">ok</Badge>;\n`,
      );
      await writeFile(
        join(brokenDir, "Broken.tsx"),
        `import Badge from "@dt/Badge";\nexport const Broken = () => <Badge variant="nope">bad</Badge>;\n`,
      );
    });

    afterAll(async () => {
      await rm(cleanDir, { recursive: true, force: true });
      await rm(brokenDir, { recursive: true, force: true });
    });

    it("passes contract and usage checks for a clean scope", async () => {
      const result = await verify(["badge"], {
        path: cleanDir,
        skip: "tests,types",
      });
      expect(result.type).toBe("verify.report");
      expect(result.data.components).toEqual(["Badge"]);
      expect(result.data.skipped).toEqual(["tests", "types"]);
      expect(result.data.verified).toBe(true);
      const contract = result.data.checks.find(({ id }) => id === "contract");
      expect(contract.status).toBe("pass");
      expect(contract.detail).toContain("Badge");
      const usage = result.data.checks.find(({ id }) => id === "usage");
      expect(usage.status).toBe("pass");
    });

    it("fails verification when scoped usage has contract violations", async () => {
      const result = await verify(["Badge"], {
        path: brokenDir,
        skip: "tests,types",
      });
      expect(result.data.verified).toBe(false);
      const usage = result.data.checks.find(({ id }) => id === "usage");
      expect(usage.status).toBe("fail");
      expect(usage.detail).toContain("nope");
    });

    it("exits non-zero from the CLI when a check fails", async () => {
      await expect(
        execFileAsync(process.execPath, [
          "packages/cli/src/cli.mjs",
          "verify",
          "Badge",
          "--path",
          brokenDir,
          "--skip",
          "tests,types",
        ]),
      ).rejects.toMatchObject({ code: 2 });
    });

    it("rejects unknown components, checks, and empty scope", async () => {
      await expect(verify([], {})).rejects.toMatchObject({
        code: "ERR_MISSING_ARGUMENT",
      });
      await expect(verify(["Buttn"], {})).rejects.toMatchObject({
        code: "ERR_UNKNOWN_COMPONENT",
      });
      await expect(
        verify(["Badge"], { skip: "tests,frobnicate" }),
      ).rejects.toMatchObject({ code: "ERR_INVALID_ARGUMENT" });
    });
  });

  it("keeps the capability manifest in sync with the new commands", async () => {
    const result = await manifest();
    const names = result.data.commands.map((command) => command.name);
    expect(names).toContain("diff");
    expect(names).toContain("affected");
    expect(result.data.errorCodes).toContain("ERR_GIT_CONTEXT_UNAVAILABLE");
  });
});
