import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import {
  component,
  compose,
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
});
