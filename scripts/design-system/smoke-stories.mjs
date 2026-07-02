#!/usr/bin/env node
/**
 * Storybook render smoke test.
 *
 * Goal: fail fast if *any* story crashes at render-time (\"The component failed to render properly\").
 * This is intentionally lightweight compared to the full story test matrix planned later.
 *
 * Usage:
 *   node scripts/design-system/smoke-stories.mjs
 *
 * Environment:
 *   STORYBOOK_SMOKE_PORT=6010 (optional)
 *   STORYBOOK_SMOKE_LIMIT=200 (optional, defaults to 200)
 */
import { spawn } from "node:child_process";
import http from "node:http";
import process from "node:process";

const DEFAULT_PORT = Number(process.env.STORYBOOK_SMOKE_PORT || "6010");
const LIMIT = Number(process.env.STORYBOOK_SMOKE_LIMIT || "200");

const STORYBOOK_URL = `http://127.0.0.1:${DEFAULT_PORT}`;
const STORY_INDEX_URL = `${STORYBOOK_URL}/index.json`;

const RENDER_ERROR_NEEDLE_1 = "The component failed to render properly";
const RENDER_ERROR_NEEDLE_2 = "Error:";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode || 0, data }));
    });
    req.on("error", reject);
    req.setTimeout(15_000, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
  });
}

async function waitForIndexJson(timeoutMs = 120_000) {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const { status } = await fetchText(STORY_INDEX_URL);
      if (status === 200) return;
    } catch {
      // ignore until timeout
    }
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Storybook did not become ready at ${STORYBOOK_URL}`);
    }
    await sleep(500);
  }
}

function parseStoryIds(indexJson) {
  const parsed = JSON.parse(indexJson);
  const entries = parsed?.entries;
  if (!entries || typeof entries !== "object") {
    throw new Error("index.json missing entries");
  }
  return Object.entries(entries)
    .filter(([, v]) => v && v.type === "story")
    .map(([id]) => id);
}

async function smokeStory(id) {
  const url = `${STORYBOOK_URL}/?path=/story/${id}`;
  const { status, data } = await fetchText(url);
  if (status !== 200) {
    return { ok: false, id, url, reason: `HTTP ${status}` };
  }
  if (data.includes(RENDER_ERROR_NEEDLE_1) && data.includes(RENDER_ERROR_NEEDLE_2)) {
    return { ok: false, id, url, reason: "render error envelope" };
  }
  return { ok: true, id, url };
}

async function main() {
  const storybook = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "storybook", "--", "--ci", "--quiet"],
    {
      stdio: "pipe",
      env: { ...process.env, BROWSER: "none" },
      // Own process group (POSIX): npm does NOT forward signals to its children, so killing
      // only the wrapper leaves the storybook/vite tree alive holding this process's stdio
      // pipes — on the Linux CI runners that pinned the event loop and hung the step forever
      // AFTER the smoke had already passed (macOS happened to tear the tree down).
      detached: process.platform !== "win32",
    },
  );

  let storybookLog = "";
  storybook.stdout.on("data", (d) => (storybookLog += String(d)));
  storybook.stderr.on("data", (d) => (storybookLog += String(d)));

  const cleanup = () => {
    try {
      if (process.platform === "win32") storybook.kill("SIGTERM");
      else process.kill(-storybook.pid, "SIGTERM"); // negative pid = the whole group
    } catch {
      // ignore
    }
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    await waitForIndexJson();
    const indexRes = await fetchText(STORY_INDEX_URL);
    const ids = parseStoryIds(indexRes.data);

    const slice = ids.slice(0, LIMIT);
    const failures = [];
    for (const id of slice) {
      // serialize fetches to keep this predictable and low-noise in CI
      // eslint-disable-next-line no-await-in-loop
      const result = await smokeStory(id);
      if (!result.ok) failures.push(result);
    }

    if (failures.length) {
      // eslint-disable-next-line no-console
      console.error("\nStorybook smoke failures:\n");
      for (const f of failures.slice(0, 25)) {
        // eslint-disable-next-line no-console
        console.error(`- ${f.id}: ${f.reason} (${f.url})`);
      }
      if (failures.length > 25) {
        // eslint-disable-next-line no-console
        console.error(`\n… and ${failures.length - 25} more`);
      }
      process.exitCode = 1;
      return;
    }

    // eslint-disable-next-line no-console
    console.log(
      `Storybook smoke OK: ${slice.length}/${ids.length} stories (${STORYBOOK_URL})`,
    );
  } finally {
    cleanup();
  }
}

main()
  .then(() => {
    // Explicit exit: even a stray survivor of the group kill must not keep this process
    // (and therefore the CI step) alive via a lingering pipe. exitCode carries failures.
    process.exit(process.exitCode ?? 0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

