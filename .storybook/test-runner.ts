import { fileURLToPath } from "node:url";
import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext } from "@storybook/test-runner";
import type { Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { captureStoryAccessibilityTree } from "../scripts/design-system/a11y-snapshot-capture-lib.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SNAPSHOT_ROOT = path.join(ROOT, "__visual__", "snapshots");
const DIFF_ROOT = path.join(ROOT, "__visual__", "diffs");
const SNAPSHOT_DIR = path.join(SNAPSHOT_ROOT, "__reference__");
const DIFF_DIR = path.join(DIFF_ROOT, "__diff_output__");

const SKIP_PREFIXES = ["testing-kitchen-sink--", "components-link--"];
const FAILURE_THRESHOLD = 0.005; // 0.5% of pixels by default
const DEFAULT_STABILIZATION_DELAY_MS = 500;
const DEFAULT_SELECTOR_TIMEOUT_MS = 5_000;
const UPDATE_SNAPSHOTS =
  (process.env.STORYBOOK_VISUAL_UPDATE ?? "").toLowerCase() === "true";
const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

ensureDir(SNAPSHOT_DIR);
ensureDir(DIFF_DIR);

let hasExtendedMatchers = false;

const ensureMatchers = () => {
  const jestExpect = (
    globalThis as typeof globalThis & {
      expect?: any;
    }
  ).expect;

  if (!jestExpect) {
    throw new Error("Storybook test runner expect is not available yet.");
  }

  if (!hasExtendedMatchers) {
    hasExtendedMatchers = true;
  }

  return jestExpect;
};

const sanitizeId = (id: string) =>
  id
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

const shouldSkipStory = (storyId: string) =>
  SKIP_PREFIXES.some((prefix) => storyId.startsWith(prefix));

type StoryContextForVisualTest = Awaited<ReturnType<typeof getStoryContext>>;

type VisualRegressionParameters = {
  disable?: boolean;
  threshold?: number | string;
  waitFor?: number | "networkidle";
  waitForTimeout?: number;
  waitForSelector?:
    | string
    | {
        selector: string;
        state?: "attached" | "detached" | "hidden" | "visible";
        timeout?: number;
      };
  waitForNetworkIdle?: boolean;
  waitForFonts?: boolean;
  beforeScreenshot?: (args: {
    page: Page;
    context: StoryContextForVisualTest;
  }) => Promise<void> | void;
};

const getVisualParameters = (
  storyContext: StoryContextForVisualTest | undefined,
): VisualRegressionParameters => {
  const params = storyContext?.parameters?.visualRegression;
  if (params && typeof params === "object") {
    return params as VisualRegressionParameters;
  }

  return {};
};

const parseThreshold = (
  storyContext: StoryContextForVisualTest | undefined,
) => {
  const params = getVisualParameters(storyContext);
  const value = params.threshold;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return FAILURE_THRESHOLD;
};

const toSelectorConfig = (
  selector: VisualRegressionParameters["waitForSelector"],
) => {
  if (!selector) {
    return undefined;
  }

  if (typeof selector === "string") {
    return {
      selector,
      state: "visible" as const,
      timeout: DEFAULT_SELECTOR_TIMEOUT_MS,
    };
  }

  if (typeof selector === "object" && "selector" in selector) {
    return {
      selector: selector.selector,
      state: selector.state ?? "visible",
      timeout: selector.timeout ?? DEFAULT_SELECTOR_TIMEOUT_MS,
    };
  }

  return undefined;
};

const computeDelayMs = (params: VisualRegressionParameters) => {
  const candidates = [params.waitFor, params.waitForTimeout];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return undefined;
};

const waitForFontsIfNeeded = async (
  page: Page,
  params: VisualRegressionParameters,
) => {
  if (params.waitForFonts === false) {
    return;
  }

  await page
    .evaluate(async () => {
      if ("fonts" in document) {
        try {
          // @ts-expect-error fonts typings differ across environments
          await document.fonts.ready;
        } catch {
          // ignore font loading errors to keep tests running
        }
      }
    })
    .catch(() => {
      // If the page navigated away, keep going.
    });
};

const waitForStoryStability = async (
  page: Page,
  storyContext: StoryContextForVisualTest,
) => {
  const params = getVisualParameters(storyContext);

  if (params.waitForNetworkIdle || params.waitFor === "networkidle") {
    await page.waitForLoadState("networkidle");
  }

  const selectorConfig = toSelectorConfig(params.waitForSelector);
  if (selectorConfig?.selector) {
    await page.waitForSelector(selectorConfig.selector, {
      state: selectorConfig.state,
      timeout: selectorConfig.timeout,
    });
  }

  await waitForFontsIfNeeded(page, params);

  if (typeof params.beforeScreenshot === "function") {
    await params.beforeScreenshot({ page, context: storyContext });
  }

  const delay = computeDelayMs(params) ?? DEFAULT_STABILIZATION_DELAY_MS;
  if (delay > 0) {
    await page.waitForTimeout(delay);
  }
};


const ROOT_DIR = ROOT;
const UPDATE_AT = process.env.DT_UPDATE_A11Y_SNAPSHOTS === "1";
const BOOTSTRAP_AT = process.env.DT_BOOTSTRAP_A11Y_SNAPSHOTS === "1";
const REQUIRE_AT = process.env.DT_REQUIRE_A11Y_SNAPSHOTS === "1";
const THEME = (process.env.DT_THEME ?? "").toLowerCase();
const FORCED_COLORS = (process.env.DT_FORCED_COLORS ?? "").toLowerCase();
const VIEWPORT = Number.parseInt(process.env.DT_VIEWPORT ?? "", 10);

let storyDirMap: Promise<Map<string, string>> | null = null;

/**
 * Map story id -> component directory, from Storybook's own index.
 *
 * This used to be derived by scraping `title:` out of every `*.stories.tsx`
 * under a hard-coded root list, then re-implementing @storybook/csf's `sanitize`
 * to turn that title back into a story-id prefix. Re-deriving what Storybook
 * already knows was wrong in four independent ways, and every one of them failed
 * *silently* — an unresolved dir means `captureAccessibilityTree` returns early,
 * so the component simply had no snapshots and no enforcement, with no error:
 *
 *   1. `readdirSync(base)` was flat, so nested components (`components/
 *      animations/FadeIn`) were never seen.
 *   2. The root list omitted `templates/`, so `NextLayoutShell` was never seen —
 *      even though tag-beta-matrix-stories.mjs *does* walk templates, so its
 *      stories were tagged and run but never captured.
 *   3. The contract was assumed to be `<DirName>.contract.json`, so a second
 *      component sharing a directory (`SelectableCard/SelectableCardGroup`) was
 *      never seen.
 *   4. The "first `title:` containing a slash is the meta title" heuristic was
 *      itself a fix for arg-title hijacking, and it was incomplete: NavMenuList
 *      and SentrySummaryCard seed a checklist arg `title: "Design tokens for
 *      spacing/colors"`, which contains a slash and wins the match, mapping the
 *      directory under a prefix no story id can ever have.
 *
 * The index carries `importPath` per story, so the directory is a fact rather
 * than an inference and all four classes disappear at once. The contract check
 * is kept so scope is unchanged: `shared/stories/WebComponents/**` holds no
 * contracts and stays excluded, exactly as it was under the old roots list.
 */
async function loadStoryDirMap(): Promise<Map<string, string>> {
  if (storyDirMap) return storyDirMap;
  storyDirMap = (async () => {
    const target = process.env.TARGET_URL ?? "";
    const res = await fetch(new URL("index.json", target).toString());
    if (!res.ok) {
      throw new Error(`Storybook index fetch failed: ${res.status} ${res.statusText}`);
    }
    const index = (await res.json()) as {
      entries?: Record<string, { importPath?: string }>;
    };
    const map = new Map<string, string>();
    const dirHasContract = new Map<string, boolean>();

    for (const [id, entry] of Object.entries(index.entries ?? {})) {
      if (!entry.importPath) continue;
      const dir = path.dirname(path.resolve(ROOT_DIR, entry.importPath));
      let hasContract = dirHasContract.get(dir);
      if (hasContract === undefined) {
        hasContract =
          fs.existsSync(dir) &&
          fs.readdirSync(dir).some((f) => f.endsWith(".contract.json"));
        dirHasContract.set(dir, hasContract);
      }
      if (hasContract) map.set(id, dir);
    }
    return map;
  })();
  return storyDirMap;
}

async function componentSnapshotDir(storyId: string): Promise<string | null> {
  const componentDir = (await loadStoryDirMap()).get(storyId);
  if (!componentDir) return null;
  return path.join(componentDir, "__a11y-snapshots__");
}

function snapshotVariantSuffix(): string {
  const parts: string[] = [];
  if (THEME) parts.push(THEME);
  if (FORCED_COLORS === "active") parts.push("forced-colors");
  return parts.length > 0 ? `.${parts.join(".")}` : "";
}

const MODE_SUFFIXES = [".light", ".dark", ".forced-colors"];

/**
 * Does this component already have at least one snapshot for the given mode?
 * Plain mode (suffix "") = any `<id>.yaml` that carries no mode segment; a
 * suffixed mode = any file ending in `<suffix>.yaml`. Used to decide whether a
 * missing snapshot is an uncovered story in an established mode (hard error) or
 * a mode that was never bootstrapped for this component (tracked debt).
 */
function modeHasEstablishedCoverage(dir: string, suffix: string): boolean {
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  } catch {
    return false;
  }
  if (suffix === "") {
    return files.some(
      (f) => f.includes("--") && !MODE_SUFFIXES.some((s) => f.endsWith(`${s}.yaml`)),
    );
  }
  return files.some((f) => f.endsWith(`${suffix}.yaml`));
}

async function captureAccessibilityTree(
  page: import("playwright").Page,
  storyId: string,
  { betaMatrix = false }: { betaMatrix?: boolean } = {},
) {
  const dir = await componentSnapshotDir(storyId);
  if (!dir) return;
  fs.mkdirSync(dir, { recursive: true });
  const suffix = snapshotVariantSuffix();
  const file = path.join(dir, `${storyId}${suffix}.yaml`);
  const content = await captureStoryAccessibilityTree(page);
  if (!fs.existsSync(file)) {
    if (UPDATE_AT || BOOTSTRAP_AT) {
      fs.writeFileSync(file, content);
      return;
    }
    // Only hard-require a missing snapshot when this component already has
    // coverage for THIS mode — i.e. a sibling story's snapshot exists with the
    // same suffix. That makes existing snapshots enforced (they were silently
    // dead before the resolver fix) and keeps partial coverage graceful: a mode
    // that was never bootstrapped is tracked backfill debt (audit:snapshot-debt),
    // not a build break. Stable promotion is gated separately by
    // validate-components, which hard-requires the files.
    if (REQUIRE_AT && betaMatrix && modeHasEstablishedCoverage(dir, suffix)) {
      throw new Error(
        `Missing AT snapshot for ${storyId}${suffix} (this component already has ${suffix || "plain"}-mode snapshots — a story is uncovered). ` +
          `Run DT_UPDATE_A11Y_SNAPSHOTS=1 npm run test:stories:ci`,
      );
    }
    return;
  }
  if (!betaMatrix && !(UPDATE_AT || BOOTSTRAP_AT)) {
    return;
  }
  const existing = fs.readFileSync(file, "utf8");
  if (existing !== content) {
    if (UPDATE_AT) fs.writeFileSync(file, content);
    else
      throw new Error(
        `AT snapshot mismatch for ${storyId}${snapshotVariantSuffix()}.` +
          ` Run DT_UPDATE_A11Y_SNAPSHOTS=1 npm run test:stories:ci`,
      );
  }
}

const config: TestRunnerConfig = {
  // The iframe page is loaded once per worker by `defaultPrepare`, so the preview
  // module's `parameters.a11y` IIFE only sees `matchMedia('(forced-colors: active)')`
  // if the emulation is applied BEFORE that navigation. We provide a custom
  // `prepare` that runs the emulation + init scripts first, then triggers the
  // navigation Playwright would have made.
  async prepare({ page, browserContext, testRunnerConfig: testRunnerConfig2 }) {
    const targetURL = process.env.TARGET_URL ?? "";
    const iframeURL = new URL("iframe.html", targetURL).toString();
    if (testRunnerConfig2?.getHttpHeaders) {
      const headers = await testRunnerConfig2.getHttpHeaders(iframeURL);
      await browserContext.setExtraHTTPHeaders(headers);
    }
    if (THEME) {
      await page.addInitScript((theme) => {
        try {
          window.localStorage.setItem("storybook-theme", theme);
          window.localStorage.setItem("theme", theme);
        } catch {
          // ignore
        }
      }, THEME);
    }
    if (FORCED_COLORS === "active") {
      await page.emulateMedia({ forcedColors: "active" });
    }
    await page.goto(iframeURL, { waitUntil: "load" });
  },
  async preVisit(page) {
    const width = Number.isFinite(VIEWPORT) && VIEWPORT > 0 ? VIEWPORT : 1280;
    await page.setViewportSize({ width, height: 720 });
    await page.addInitScript(() => {
      window.__STORYBOOK_VISUAL_REGRESSION__ = true;
      try {
        window.localStorage.setItem("STORYBOOK_VISUAL_REGRESSION", "true");
      } catch {
        // ignore cases where localStorage is unavailable
      }
    });
    // Re-assert forced-colors per story in case the page was reset.
    if (FORCED_COLORS === "active") {
      await page.emulateMedia({ forcedColors: "active" });
    }
    // Force prefers-reduced-motion so JS-driven animations (GSAP/Framer) collapse
    // to no-op tweens. Without this, axe color-contrast misreports partial-opacity
    // frames (e.g. FadeIn at 60%) as 3.x:1 contrast violations.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition-duration: 0s !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          animation-iteration-count: 1 !important;
        }
      `,
    });
  },
  async postVisit(page, context) {
    const viewMode = context.viewMode ?? "story";
    if (viewMode !== "story" || shouldSkipStory(context.id)) {
      return;
    }

    const storyContext = await getStoryContext(page, context);
    const storyId = sanitizeId(context.id);
    const storyTags = [
      ...(Array.isArray(storyContext?.tags) ? storyContext.tags : []),
      ...(Array.isArray(context.tags) ? context.tags : []),
    ];
    const betaMatrix = storyTags.includes("beta-matrix");

    // Deterministic AT capture for stories with React.lazy content: a cold
    // page loses the race between the lazy chunk and the capture, a warmed
    // worker wins it, and the snapshot flips run-to-run (NextLayout's chat
    // toggle). Stories declare the late element; capture waits for it.
    const atWaitSelector = (
      storyContext?.parameters as
        | { atSnapshot?: { waitForSelector?: string } }
        | undefined
    )?.atSnapshot?.waitForSelector;
    if (atWaitSelector) {
      await page
        .waitForSelector(atWaitSelector, { state: "visible", timeout: 5_000 })
        .catch(() => {
          // Capture proceeds; a genuinely missing element then surfaces as a
          // visible snapshot mismatch instead of a silent skip.
        });
    }

    // AT-tree snapshots are the DSharp-style gate for Phase 2.
    await captureAccessibilityTree(page, context.id, { betaMatrix });

    // Visual pixel diffs are opt-in (Phase 4). Running them on every story makes
    // the matrix flaky while Vite is still optimizing dependencies.
    if (process.env.DT_VISUAL_SNAPSHOTS !== "1") {
      return;
    }
    if (storyContext?.parameters?.visualRegression?.disable) {
      return;
    }

    await waitForStoryStability(page, storyContext);

    const screenshot = await page.screenshot({
      animations: "disabled",
      fullPage: false,
    });

    recordSnapshot(storyId, screenshot, context.id, storyContext);
  },
};

export default config;

const getPathsForStory = (storyId: string) => {
  const baseline = path.join(SNAPSHOT_DIR, `${storyId}.png`);
  const actual = path.join(DIFF_DIR, `${storyId}-actual.png`);
  const baselineCopy = path.join(DIFF_DIR, `${storyId}-baseline.png`);
  const diff = path.join(DIFF_DIR, `${storyId}-diff.png`);

  return { baseline, actual, baselineCopy, diff };
};

const writeFile = (filePath: string, buffer: Buffer) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, buffer);
};

const deleteIfExists = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true });
  }
};

const recordSnapshot = (
  storyId: string,
  screenshot: Buffer,
  humanId: string,
  storyContext: StoryContextForVisualTest,
) => {
  ensureMatchers();

  const { baseline, actual, baselineCopy, diff } = getPathsForStory(storyId);
  const baselineExists = fs.existsSync(baseline);

  if (!baselineExists || UPDATE_SNAPSHOTS) {
    writeFile(baseline, screenshot);
    deleteIfExists(actual);
    deleteIfExists(baselineCopy);
    deleteIfExists(diff);
    return;
  }

  const baselineImage = PNG.sync.read(fs.readFileSync(baseline));
  const actualImage = PNG.sync.read(screenshot);

  if (
    baselineImage.width !== actualImage.width ||
    baselineImage.height !== actualImage.height
  ) {
    writeFile(actual, PNG.sync.write(actualImage));
    writeFile(baselineCopy, fs.readFileSync(baseline));
    throw new Error(
      `Visual regression detected for ${humanId}: dimensions changed from ${baselineImage.width}x${baselineImage.height} to ${actualImage.width}x${actualImage.height}`,
    );
  }

  const { width, height } = baselineImage;
  const diffImage = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baselineImage.data,
    actualImage.data,
    diffImage.data,
    width,
    height,
    {
      threshold: 0.1,
      includeAA: true,
    },
  );

  const totalPixels = width * height;
  const diffRatio = diffPixels / totalPixels;
  const threshold = parseThreshold(storyContext);

  if (diffRatio > threshold) {
    writeFile(actual, PNG.sync.write(actualImage));
    writeFile(baselineCopy, fs.readFileSync(baseline));
    writeFile(diff, PNG.sync.write(diffImage));
    throw new Error(
      `Visual regression detected for ${humanId}: ${(diffRatio * 100).toFixed(2)}% of pixels differ`,
    );
  }

  deleteIfExists(actual);
  deleteIfExists(baselineCopy);
  deleteIfExists(diff);
};
