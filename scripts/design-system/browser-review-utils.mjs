import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import net from "node:net";
import { dirname, join, relative } from "node:path";

export const LANGUAGES = ["en", "fi", "sv"];

export const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 1000 },
  { id: "mobile", width: 390, height: 844 },
];

export const CONSENT_STATE = {
  version: 1,
  timestamp: "2026-07-08T00:00:00.000Z",
  language: "en",
  categories: {
    essential: true,
    analytics: true,
    marketing: true,
    functional: true,
  },
};

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

export function writeJson(path, data) {
  ensureDir(dirname(path));
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

export function relativePath(root, path) {
  return relative(root, path).replaceAll("\\", "/");
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function findFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") {
          resolve(address.port);
        } else {
          reject(new Error("Could not allocate a free port."));
        }
      });
    });
  });
}

export async function waitForHttp(url, timeoutMs = 120_000, getDebug = () => "") {
  const startedAt = Date.now();
  let lastError = "";

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5_000),
      });
      if (response.ok) return;
      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(500);
  }

  const debug = getDebug();
  throw new Error(
    `Timed out waiting for ${url}. Last error: ${lastError}${debug ? `\n${debug}` : ""}`,
  );
}

export async function startNextServer(root) {
  const existingBaseUrl =
    process.env.DT_APP_BASE_URL || process.env.APP_URL || process.env.NEXT_BASE_URL;
  if (existingBaseUrl) {
    const baseUrl = existingBaseUrl.replace(/\/$/, "");
    await waitForHttp(baseUrl);
    return {
      baseUrl,
      reused: true,
      async stop() {},
    };
  }

  const buildIdPath = join(root, ".next/BUILD_ID");
  if (!existsSync(buildIdPath)) {
    throw new Error(
      "Missing .next/BUILD_ID. Run `npm run build` before browser dogfood checks.",
    );
  }

  const nextBin = join(root, "node_modules/next/dist/bin/next");
  if (!existsSync(nextBin)) {
    throw new Error(`Missing Next.js binary at ${nextBin}. Run npm install first.`);
  }

  const port = await findFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const output = [];
  const child = spawn(
    process.execPath,
    [nextBin, "start", "-p", String(port), "-H", "127.0.0.1"],
    {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const collect = (chunk) => {
    output.push(String(chunk));
    while (output.length > 80) output.shift();
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);

  let exited = false;
  child.once("exit", (code, signal) => {
    exited = true;
    collect(`\n[next start exited: code=${code ?? "null"} signal=${signal ?? "null"}]\n`);
  });

  const stop = async () => {
    if (exited) return;
    child.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => child.once("exit", resolve)),
      delay(5_000).then(() => {
        if (!exited) child.kill("SIGKILL");
      }),
    ]);
  };

  try {
    await waitForHttp(baseUrl, 120_000, () => output.join(""));
  } catch (error) {
    await stop();
    throw error;
  }

  return {
    baseUrl,
    reused: false,
    stop,
  };
}

export async function createReviewContext(browser, baseUrl, language, viewport) {
  const context = await browser.newContext({
    baseURL: baseUrl,
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: "reduce",
  });

  await context.addCookies([
    {
      name: "i18next",
      value: language,
      url: baseUrl,
    },
  ]);
  await context.addInitScript(
    ({ consentState, language: initialLanguage }) => {
      window.localStorage.setItem("i18nextLng", initialLanguage);
      window.localStorage.setItem(
        "dt-cookie-consent",
        JSON.stringify({ ...consentState, language: initialLanguage }),
      );
      document.cookie = `i18next=${initialLanguage}; path=/; max-age=31536000`;
      Math.random = () => 0;
    },
    { consentState: CONSENT_STATE, language },
  );

  return context;
}

export async function stabilizePage(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
        }
      `,
    })
    .catch(() => {});
  await page.evaluate(async () => {
    if ("fonts" in document) {
      try {
        await document.fonts.ready;
      } catch {
        // Ignore font readiness failures in browser smoke tests.
      }
    }
  });
  await page.waitForTimeout(250);
}

export async function gotoAndStabilize(page, path) {
  await page.goto(path, { waitUntil: "load", timeout: 60_000 });
  await stabilizePage(page);
}

export async function pageSummary(page) {
  return await page.evaluate(() => ({
    title: document.title,
    h1: Array.from(document.querySelectorAll("h1"))
      .map((node) => node.textContent?.trim())
      .filter(Boolean),
    url: window.location.pathname,
  }));
}

export function createRowsSummary(rows) {
  const passed = rows.filter((row) => row.ok === true).length;
  const failed = rows.length - passed;
  return {
    total: rows.length,
    passed,
    failed,
    languages: [...new Set(rows.map((row) => row.language).filter(Boolean))].sort(),
    viewports: [...new Set(rows.map((row) => row.viewport).filter(Boolean))].sort(),
    categories: [...new Set(rows.map((row) => row.category).filter(Boolean))].sort(),
    kinds: [...new Set(rows.map((row) => row.kind).filter(Boolean))].sort(),
  };
}
