#!/usr/bin/env node
/**
 * check:target-size: WCAG 2.2 AA target size (2.5.8) per component.
 *
 * Loads the Default and Example story of every stable component in a real
 * browser (Storybook must be running) and measures every visible pointer
 * target. A target passes when it is at least --size-target-min (24px) on
 * both axes, or when a 24px circle on its centre clears every other target
 * (the spacing exception). Links inside a line of text are exempt, as the
 * criterion allows. The site-level 44px phone test lives in
 * tests/a11y/operable/touch-targets.spec.ts; this one covers components.
 *
 *   npm run check:target-size                 # fails on targets not in the baseline
 *   npm run check:target-size -- --update     # accept the current offenders
 *   STORYBOOK_URL=http://localhost:6011 npm run check:target-size
 *
 * The baseline lists offenders by story and target, never a count, so a fix
 * shows up as a removed line and a new offender fails by name.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASELINE = join(ROOT, "scripts/design-system/target-size-baseline.json");
const STORYBOOK = (process.env.STORYBOOK_URL ?? "http://localhost:6010").replace(/\/$/, "");
const UPDATE = process.argv.includes("--update");
const MIN = 24;

const stableComponents = new Set();
for (const base of ["nextjs-app/shared/components", "nextjs-app/shared/patterns"]) {
  for (const name of readdirSync(join(ROOT, base))) {
    const file = join(ROOT, base, name, `${name}.contract.json`);
    if (!existsSync(file)) continue;
    const contract = JSON.parse(readFileSync(file, "utf8"));
    if (contract.status === "stable") stableComponents.add(contract.name ?? name);
  }
}

const index = await fetch(`${STORYBOOK}/index.json`)
  .then((response) => response.json())
  .catch(() => {
    console.error(`✗ No Storybook at ${STORYBOOK}. Start it with npm run storybook.`);
    process.exit(2);
  });

const stories = Object.values(index.entries).filter((entry) => {
  if (entry.type !== "story" || entry.title.startsWith("Web Components/")) return false;
  const name = entry.title.split("/").pop();
  return stableComponents.has(name) && /^(default|example)$/i.test(entry.name);
});

/** Runs in the page: returns undersized targets that the spacing exception does not save. */
function measure(min) {
  const selector = [
    "a[href]",
    "button",
    "input:not([type=hidden])",
    "select",
    "textarea",
    "summary",
    "[role=button]",
    "[role=link]",
    "[role=checkbox]",
    "[role=radio]",
    "[role=switch]",
    "[role=tab]",
    "[role=menuitem]",
    "[role=option]",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  const root = document.querySelector("#storybook-root") ?? document.body;
  const visible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      Number(style.opacity) > 0 &&
      rect.width > 2 &&
      rect.height > 2
    );
  };
  // A link set inside a sentence: inline, with text around it in its block.
  const inlineInText = (element) => {
    if (element.tagName !== "A" || getComputedStyle(element).display !== "inline") return false;
    const block = element.closest("p, li, td, dd, figcaption, blockquote");
    return Boolean(block && block.textContent.trim().length > element.textContent.trim().length);
  };
  // A visually hidden native input whose visible label is the real target.
  const labelled = (element) =>
    element.matches("input") && element.labels && [...element.labels].some(visible);

  const targets = [...root.querySelectorAll(selector)].filter(
    (element, _, all) =>
      visible(element) &&
      !inlineInText(element) &&
      !labelled(element) &&
      // Count the outermost target only (a button inside a link, an input in a role=checkbox).
      !all.some((other) => other !== element && other.contains(element) && visible(other)),
  );
  const boxes = targets.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      element,
      rect,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      small: rect.width < min - 0.5 || rect.height < min - 0.5,
    };
  });
  const distanceToRect = (x, y, rect) => {
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.hypot(dx, dy);
  };
  const name = (element) =>
    (
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.textContent ||
      element.getAttribute("name") ||
      element.getAttribute("type") ||
      ""
    )
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);

  // Spacing exception: a 24px circle on an undersized target's centre must
  // not reach another target, nor another undersized target's circle.
  const crowded = (box) =>
    boxes.some((other) =>
      other === box
        ? false
        : other.small
          ? Math.hypot(other.cx - box.cx, other.cy - box.cy) < min
          : distanceToRect(box.cx, box.cy, other.rect) < min / 2,
    );

  return boxes
    .filter((box) => box.small && crowded(box))
    .map((box) => ({
      target: `${box.element.tagName.toLowerCase()} "${name(box.element)}"`,
      size: `${Math.round(box.rect.width)}x${Math.round(box.rect.height)}`,
    }));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const found = new Map();
for (const story of stories) {
  await page.goto(`${STORYBOOK}/iframe.html?viewMode=story&id=${story.id}`, {
    waitUntil: "networkidle",
    timeout: 90_000,
  });
  await page.waitForSelector("#storybook-root > *", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(400);
  for (const offender of await page.evaluate(measure, MIN)) {
    found.set(`${story.id} :: ${offender.target}`, offender.size);
  }
}
await browser.close();

const current = Object.fromEntries([...found.entries()].sort(([a], [b]) => a.localeCompare(b)));
if (UPDATE) {
  writeFileSync(
    BASELINE,
    `${JSON.stringify({ $comment: "Undersized pointer targets accepted by npm run check:target-size -- --update. Fix one, then rerun --update so it leaves the list.", offenders: current }, null, 2)}\n`,
  );
  console.log(`✓ target-size baseline updated: ${Object.keys(current).length} offenders in ${stories.length} stories`);
  process.exit(0);
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")).offenders : {};
const added = Object.keys(current).filter((key) => !(key in baseline));
const fixed = Object.keys(baseline).filter((key) => !(key in current));
for (const key of added) console.error(`✗ ${key} is ${current[key]}px, under ${MIN}px with no spacing to spare`);
if (fixed.length) console.log(`  ${fixed.length} baseline offenders are fixed; run with --update to drop them.`);
if (added.length) process.exit(1);
console.log(`✓ Target size verified (${stories.length} stories, ${Object.keys(current).length} baselined offenders)`);
