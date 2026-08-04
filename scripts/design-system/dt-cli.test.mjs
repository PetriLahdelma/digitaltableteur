import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import {
  affected,
  classifyContractDiff,
  component,
  compose,
  diff,
  doctor,
  DtCliError,
  example,
  manifest,
  search,
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

  it("keeps the capability manifest in sync with the new commands", async () => {
    const result = await manifest();
    const names = result.data.commands.map((command) => command.name);
    expect(names).toContain("diff");
    expect(names).toContain("affected");
    expect(result.data.errorCodes).toContain("ERR_GIT_CONTEXT_UNAVAILABLE");
  });
});
