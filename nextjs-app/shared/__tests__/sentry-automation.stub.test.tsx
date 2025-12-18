import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rmSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

function runAutomation(env = {}) {
  return new Promise<string>((resolvePromise, reject) => {
    const proc = spawn(
      "node",
      [
        resolve("scripts/sentry-automation.mjs"),
        "--unresolved",
        "--force-stub",
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, ...env },
      },
    );
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => {
      if (code !== 0) return reject(new Error(err || `exit ${code}`));
      resolvePromise(out);
    });
  });
}

const summaryPath = resolve("public/observability/sentry-summary.json");

describe("Sentry automation stub mode", () => {
  beforeEach(() => {
    try {
      rmSync(summaryPath);
    } catch {
      /* ignore */
    }
  });

  afterEach(() => {
    try {
      rmSync(summaryPath);
    } catch {
      /* ignore */
    }
  });

  it("writes a stub summary JSON when forced", async () => {
    await runAutomation({});
    const contents = readFileSync(summaryPath, "utf-8");
    const json = JSON.parse(contents);
    expect(json.stub).toBe(true);
    expect(json.count).toBe(0);
    expect(json.reason).toBe("force-stub-flag");
  });
});
