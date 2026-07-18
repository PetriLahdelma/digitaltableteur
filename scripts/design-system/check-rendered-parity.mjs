#!/usr/bin/env node
/**
 * Rendered-parity gate: screenshots each native web-component story next to
 * its canonical React twin and compares PIXELS and GEOMETRY across a
 * viewport/theme matrix.
 *
 * Story-name parity, contracts, and jsdom tests all verify DECLARATIONS;
 * none of them look at rendering, which is the channel every visual drift
 * (menu row highlight, empty-state icon sizes, clipped panels) escaped
 * through. React is the visual source of truth; a native pair must match it.
 *
 * Enforcement is roster-based (rendered-parity.roster.mjs): audited
 * components fail the gate on any regression; unaudited ones are measured
 * and reported so the fleet score is honest while the audit proceeds
 * component by component. Intentional divergence needs a narrow, reviewed
 * exception with a reason — there is no blanket threshold and no automatic
 * baseline acceptance.
 *
 *   npm run check:rendered-parity                 # against running Storybook
 *   npm run check:rendered-parity:ci              # boots Storybook itself
 *   node scripts/design-system/check-rendered-parity.mjs --component=Menu
 *   node scripts/design-system/check-rendered-parity.mjs --update-roster
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import elements from "../../packages/web-components/web-components.config.mjs";
import { enforced, exceptions } from "./rendered-parity.roster.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPORT_DIR = join(ROOT, ".omx/state/design-system/rendered-parity");
const ROSTER_PATH = join(
  ROOT,
  "scripts/design-system/rendered-parity.roster.mjs",
);

const baseUrl =
  process.argv
    .find((argument) => argument.startsWith("--url="))
    ?.slice("--url=".length) ?? "http://127.0.0.1:6010";
const componentFilter = process.argv
  .find((argument) => argument.startsWith("--component="))
  ?.slice("--component=".length)
  ?.toLowerCase();
const updateRoster = process.argv.includes("--update-roster");

/**
 * Anti-aliasing noise between two renders of identical markup in one
 * deterministic browser; anything above this is a real difference.
 */
const PIXEL_TOLERANCE = 0.01;
/** Content boxes may differ by this much before geometry fails. */
const GEOMETRY_TOLERANCE_PX = 4;
const GEOMETRY_TOLERANCE_RATIO = 0.02;
/** Exceptions record a measured ratio; drifting past it fails. */
const EXCEPTION_SLACK = 0.005;

const DESKTOP = { width: 1000, height: 700 };
const MOBILE = { width: 375, height: 812 };

/**
 * Comparison matrix. Default renders once (desktop/light); the Example
 * story — the canonical showcase — covers mobile, dark, and forced-colors.
 */
const MODES = [
  { key: "desktop-light", story: "Default", viewport: DESKTOP },
  { key: "desktop-light", story: "Example", viewport: DESKTOP },
  {
    key: "mobile-light",
    story: "Example",
    viewport: MOBILE,
  },
  {
    key: "desktop-dark",
    story: "Example",
    viewport: DESKTOP,
    globals: "theme:dark",
  },
  {
    key: "desktop-forced-colors",
    story: "Example",
    viewport: DESKTOP,
    forcedColors: true,
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const nativeElements = elements.filter(
  (element) =>
    element.defaultBackend === "native" &&
    (!componentFilter ||
      element.sourceComponent.toLowerCase() === componentFilter ||
      element.tagName.toLowerCase() === componentFilter),
);
if (nativeElements.length === 0) {
  throw new Error(`No native component matches ${componentFilter}`);
}

// Bounded: after the wc story sweep the shared dev server can be wedged
// (accepted socket, no response); an untimed fetch here turned that into an
// infinite CI hang (2026-07-18 publish runs). Fail loudly instead.
const indexResponse = await fetch(`${baseUrl}/index.json`, {
  signal: AbortSignal.timeout(60_000),
});
if (!indexResponse.ok) {
  throw new Error(
    `Unable to read Storybook index (${indexResponse.status} ${indexResponse.statusText})`,
  );
}
const index = await indexResponse.json();
const entries = Object.values(index.entries);

function storyFolder(predicate, description) {
  const titles = new Set(
    entries.filter((entry) => predicate(entry)).map((entry) => entry.title),
  );
  if (titles.size !== 1) {
    return { error: `${description}: found ${titles.size} folders` };
  }
  const title = [...titles][0];
  const stories = new Map(
    entries
      .filter((entry) => entry.title === title && entry.type === "story")
      .map((entry) => [entry.name, entry.id]),
  );
  return { title, stories };
}

function comparisonsFor(element) {
  const component = element.sourceComponent;
  const native = storyFolder(
    (entry) =>
      entry.title.startsWith("Web Components/") &&
      entry.title.endsWith(`/${component}`),
    `${component} native folder`,
  );
  const react = storyFolder(
    (entry) =>
      !entry.title.startsWith("Web Components/") &&
      entry.title.endsWith(`/${component}`) &&
      entry.title.split("/").length === 2,
    `${component} React folder`,
  );
  if (native.error || react.error) {
    return { skipped: native.error ?? react.error, comparisons: [] };
  }
  const comparisons = [];
  for (const mode of MODES) {
    const reactId = react.stories.get(mode.story);
    const nativeId = native.stories.get(mode.story);
    if (reactId && nativeId) {
      comparisons.push({ component, mode, reactId, nativeId });
    }
  }
  return { comparisons };
}

const browser = await chromium.launch();

async function capture(context, page, storyId, mode) {
  await page.emulateMedia({
    forcedColors: mode.forcedColors ? "active" : "none",
    reducedMotion: "reduce",
  });
  const globals = mode.globals ? `&globals=${mode.globals}` : "";
  await page.goto(
    `${baseUrl}/iframe.html?id=${storyId}&viewMode=story${globals}`,
    { waitUntil: "domcontentloaded" },
  );
  // Play functions run after render; screenshotting mid-play is
  // nondeterministic. The preview's render phase reaches "finished" only
  // after render AND play complete ("errored"/"aborted" also settle).
  await page
    .waitForFunction(
      () => {
        const renders = window.__STORYBOOK_PREVIEW__?.storyRenders ?? [];
        return (
          renders.length > 0 &&
          renders.every((render) =>
            ["finished", "errored", "aborted"].includes(render.phase),
          )
        );
      },
      null,
      { timeout: 15_000 },
    )
    .catch(() => {});
  await page.addStyleTag({
    content:
      // The WIP badge is Storybook chrome, not component output; stable React
      // stories have none while native betas do, so it must not count.
      '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; } html { scroll-behavior: auto !important; } [data-axe-ignore], [class*="wipWrapper"] { display: none !important; }',
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Residual focus is an interaction state (play functions end focused),
    // not part of the story's rendered contract.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(250);
  return PNG.sync.read(await page.screenshot({ type: "png" }));
}

/**
 * Bounding box of non-background pixels, so story-layout offsets (centered
 * vs padded canvases) don't count against component fidelity. Dark and
 * forced-colors surfaces use a sampled corner color as background.
 */
function contentBounds(image) {
  const background = [image.data[0], image.data[1], image.data[2]];
  const matchesBackground = (at) =>
    Math.abs(image.data[at] - background[0]) < 6 &&
    Math.abs(image.data[at + 1] - background[1]) < 6 &&
    Math.abs(image.data[at + 2] - background[2]) < 6;
  let top = image.height;
  let left = image.width;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const at = (image.width * y + x) * 4;
      if (!matchesBackground(at)) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return null;
  const margin = 8;
  return {
    left: Math.max(0, left - margin),
    top: Math.max(0, top - margin),
    right: Math.min(image.width - 1, right + margin),
    bottom: Math.min(image.height - 1, bottom + margin),
  };
}

function cropToContent(image) {
  const bounds = contentBounds(image);
  if (!bounds) return new PNG({ width: 1, height: 1 });
  const width = bounds.right - bounds.left + 1;
  const height = bounds.bottom - bounds.top + 1;
  const cropped = new PNG({ width, height });
  PNG.bitblt(image, cropped, bounds.left, bounds.top, width, height, 0, 0);
  return cropped;
}

function diffPair(reactPng, nativePng) {
  const croppedReact = cropToContent(reactPng);
  const croppedNative = cropToContent(nativePng);
  const width = Math.max(croppedReact.width, croppedNative.width);
  const height = Math.max(croppedReact.height, croppedNative.height);
  const pad = (source) => {
    if (source.width === width && source.height === height) return source;
    const padded = new PNG({ width, height });
    padded.data.fill(255);
    PNG.bitblt(source, padded, 0, 0, source.width, source.height, 0, 0);
    return padded;
  };
  const a = pad(croppedReact);
  const b = pad(croppedNative);
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: 0.15,
  });
  const geometryDelta = {
    width: Math.abs(croppedReact.width - croppedNative.width),
    height: Math.abs(croppedReact.height - croppedNative.height),
  };
  const geometryLimit = (reactSide, nativeSide) =>
    Math.max(
      GEOMETRY_TOLERANCE_PX,
      Math.max(reactSide, nativeSide) * GEOMETRY_TOLERANCE_RATIO,
    );
  const geometryPass =
    geometryDelta.width <=
      geometryLimit(croppedReact.width, croppedNative.width) &&
    geometryDelta.height <=
      geometryLimit(croppedReact.height, croppedNative.height);
  return {
    ratio: mismatched / (width * height),
    geometryDelta,
    geometryPass,
    reactBox: { width: croppedReact.width, height: croppedReact.height },
    nativeBox: { width: croppedNative.width, height: croppedNative.height },
    diff,
    a,
    b,
  };
}

mkdirSync(REPORT_DIR, { recursive: true });
const context = await browser.newContext({ deviceScaleFactor: 1 });
const page = await context.newPage();

const results = [];
const failures = [];
const staleExceptions = [];
const cleanComponents = new Set();
const dirtyComponents = new Set();

let progress = 0;
for (const element of nativeElements) {
  progress += 1;
  console.log(
    `[${progress}/${nativeElements.length}] ${element.sourceComponent}`,
  );
  const { comparisons, skipped } = comparisonsFor(element);
  if (skipped) {
    results.push({ component: element.sourceComponent, skipped });
    continue;
  }
  for (const comparison of comparisons) {
    const { component, mode } = comparison;
    await page.setViewportSize(mode.viewport);
    const reactShot = await capture(context, page, comparison.reactId, mode);
    const nativeShot = await capture(context, page, comparison.nativeId, mode);
    const outcome = diffPair(reactShot, nativeShot);
    const key = `${component}/${mode.story}@${mode.key}`;
    const exception = exceptions.find(
      (entry) =>
        entry.component === component &&
        entry.story === mode.story &&
        entry.mode === mode.key,
    );
    const pixelPass = outcome.ratio <= PIXEL_TOLERANCE;
    const pass = pixelPass && outcome.geometryPass;
    const record = {
      component,
      story: mode.story,
      mode: mode.key,
      ratio: Number(outcome.ratio.toFixed(4)),
      geometryDelta: outcome.geometryDelta,
      geometryPass: outcome.geometryPass,
      reactBox: outcome.reactBox,
      nativeBox: outcome.nativeBox,
      pass,
      excepted: Boolean(exception),
      enforced: enforced.includes(component),
    };
    results.push(record);
    if (pass) {
      if (exception) staleExceptions.push(key);
      continue;
    }
    dirtyComponents.add(component);
    if (exception && outcome.ratio <= exception.maxRatio + EXCEPTION_SLACK) {
      continue;
    }
    if (enforced.includes(component)) {
      failures.push({
        key,
        ratio: record.ratio,
        geometry: outcome.geometryPass
          ? null
          : `Δ${outcome.geometryDelta.width}×${outcome.geometryDelta.height}px (react ${outcome.reactBox.width}×${outcome.reactBox.height}, native ${outcome.nativeBox.width}×${outcome.nativeBox.height})`,
        exceptedAt: exception?.maxRatio ?? null,
      });
    }
    const base = join(REPORT_DIR, slugify(key));
    writeFileSync(`${base}-react.png`, PNG.sync.write(outcome.a));
    writeFileSync(`${base}-native.png`, PNG.sync.write(outcome.b));
    writeFileSync(`${base}-diff.png`, PNG.sync.write(outcome.diff));
  }
  if (!dirtyComponents.has(element.sourceComponent)) {
    cleanComponents.add(element.sourceComponent);
  }
}

await browser.close();

const measured = results.filter((entry) => !entry.skipped);
const visualPassed = measured.filter(
  (entry) => entry.ratio <= PIXEL_TOLERANCE,
).length;
const geometryPassed = measured.filter((entry) => entry.geometryPass).length;
const summary = {
  generatedAt: new Date().toISOString(),
  pixelTolerance: PIXEL_TOLERANCE,
  comparisons: measured.length,
  visualParity: `${visualPassed}/${measured.length}`,
  geometryParity: `${geometryPassed}/${measured.length}`,
  enforcedComponents: `${enforced.length}/${nativeElements.length}`,
  cleanComponents: [...cleanComponents].sort(),
  results,
};
writeFileSync(
  join(REPORT_DIR, "latest.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
);

if (updateRoster) {
  const nextEnforced = [
    ...new Set([...enforced, ...cleanComponents]),
  ].sort();
  const serializedExceptions = exceptions
    .map(
      (entry) =>
        `  {\n    component: ${JSON.stringify(entry.component)},\n    story: ${JSON.stringify(entry.story)},\n    mode: ${JSON.stringify(entry.mode)},\n    maxRatio: ${entry.maxRatio},\n    reason:\n      ${JSON.stringify(entry.reason)},\n  },`,
    )
    .join("\n");
  writeFileSync(
    ROSTER_PATH,
    `/**\n * Rendered-parity enforcement roster.\n *\n * \`enforced\` lists components whose React↔native story pairs have been\n * audited and match across the comparison matrix; the gate fails on any\n * regression for them (ratchet — enforcement is never removed, only added).\n * Components not yet enrolled are measured and reported but do not fail the\n * gate; enrol them by fixing their pairs and running\n * \`check-rendered-parity.mjs --update-roster\`.\n *\n * \`exceptions\` are narrow, reviewed waivers for INTENTIONAL native\n * divergence, keyed per component/story/mode with a concrete reason.\n * No blanket thresholds, no automatic baseline acceptance: the gate fails\n * on stale exceptions (pair now matches) and on drift past the recorded\n * ratio.\n */\nexport const enforced = ${JSON.stringify(nextEnforced, null, 2)};\n\nexport const exceptions = [${serializedExceptions ? `\n${serializedExceptions}\n` : ""}];\n`,
  );
  console.log(
    `✳ roster updated: ${nextEnforced.length} enforced component(s) (${nextEnforced.length - enforced.length} newly enrolled)`,
  );
}

if (staleExceptions.length > 0 && !updateRoster) {
  console.error(
    `Stale parity exceptions (pairs now match — remove them):\n${staleExceptions
      .map((key) => `  - ${key}`)
      .join("\n")}`,
  );
}
if (failures.length > 0) {
  console.error(
    `Rendered-parity failures on enforced components (artifacts in ${REPORT_DIR}):\n${failures
      .map(
        (entry) =>
          `  - ${entry.key}: ${(entry.ratio * 100).toFixed(2)}% pixels differ${
            entry.geometry ? `; geometry ${entry.geometry}` : ""
          }${
            entry.exceptedAt !== null
              ? ` (exception recorded ${(entry.exceptedAt * 100).toFixed(2)}%)`
              : ""
          }`,
      )
      .join("\n")}`,
  );
}
if ((failures.length > 0 || staleExceptions.length > 0) && !updateRoster) {
  process.exit(1);
}
console.log(
  `✓ rendered parity: visual ${summary.visualParity}, geometry ${summary.geometryParity}, enforced ${summary.enforcedComponents} (report: .omx/state/design-system/rendered-parity/latest.json)`,
);
