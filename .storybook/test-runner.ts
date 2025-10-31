import type { TestRunnerConfig } from "@storybook/test-runner";
import { getStoryContext } from "@storybook/test-runner";
import type { Page } from "playwright";
import * as fs from "fs";
import * as path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

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
  const jestExpect = (globalThis as typeof globalThis & {
    expect?: any;
  }).expect;

  if (!jestExpect) {
    throw new Error("Storybook test runner expect is not available yet.");
  }

  if (!hasExtendedMatchers) {
    hasExtendedMatchers = true;
  }

  return jestExpect;
};

const sanitizeId = (id: string) =>
  id.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").toLowerCase();

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

const parseThreshold = (storyContext: StoryContextForVisualTest | undefined) => {
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

const waitForFontsIfNeeded = async (page: Page, params: VisualRegressionParameters) => {
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

const config: TestRunnerConfig = {
  async preVisit(page) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.addInitScript(() => {
      window.__STORYBOOK_VISUAL_REGRESSION__ = true;
      try {
        window.localStorage.setItem("STORYBOOK_VISUAL_REGRESSION", "true");
      } catch {
        // ignore cases where localStorage is unavailable
      }
    });
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
    if (storyContext?.parameters?.visualRegression?.disable) {
      return;
    }

    const storyId = sanitizeId(context.id);

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
