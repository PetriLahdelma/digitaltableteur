/**
 * Eval graders from the failure taxonomy (docs/evals/DS_MEASUREMENT_PLAN.md,
 * section 3). Each grader checks a failure MODE, not one bug: it is pointed at
 * a target (a story, a page, a commit's files) and returns
 * `{ pass, detail, evidence }`. Browser graders take a Playwright `browser`;
 * static graders read file contents at a git revision.
 *
 * Lives under agent-bench/ so the bench scrub keeps it out of the agent's
 * workspace (graders an agent can read are graders it can game).
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import {
  extractCssDefinitions,
  extractCssReferences,
  extractTsxDefinitions,
  findPhantomTokens,
} from "../../phantom-tokens-lib.mjs";

const { PNG } = createRequire(import.meta.url)("pngjs");
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const AXE_SOURCE = join(REPO_ROOT, "node_modules/axe-core/axe.min.js");
const STORYBOOK = process.env.DT_STORYBOOK_URL ?? "http://127.0.0.1:6010";

// ---------------------------------------------------------------------------
// shared helpers

/** WCAG relative luminance of an `rgb(...)`/`rgba(...)` string (alpha ignored). */
export function luminance(color) {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? ["0", "0", "0"]).slice(0, 3).map(Number);
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function isTransparent(color) {
  return !color || color === "transparent" || /rgba\([^)]*,\s*0\)$/.test(color);
}

async function openStory(browser, storyId, { theme = "light", viewport = { width: 1280, height: 900 }, contextOptions = {} } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce", ...contextOptions });
  await context.addInitScript((value) => {
    try {
      window.localStorage.setItem("storybook-theme", value);
      window.localStorage.setItem("theme", value);
    } catch {
      // storage unavailable: story renders light
    }
  }, theme);
  const page = await context.newPage();
  await page.goto(`${STORYBOOK}/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  return { page, close: () => context.close() };
}

async function runAxe(page, rules, scope = "#storybook-root") {
  await page.addScriptTag({ content: readFileSync(AXE_SOURCE, "utf8") });
  return page.evaluate(
    async ({ rules: only, scope: root }) => {
      const result = await window.axe.run(document.querySelector(root) ?? document, {
        runOnly: { type: "rule", values: only },
      });
      return result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target.join(" ")) }));
    },
    { rules, scope },
  );
}

// ---------------------------------------------------------------------------
// browser graders (stories)

/** F1: text keeps AA contrast in every listed theme (axe color-contrast). */
export async function contrastInThemes(browser, { storyId, themes = ["light", "dark", "hcb", "hcw"] }) {
  const failures = [];
  for (const theme of themes) {
    const { page, close } = await openStory(browser, storyId, { theme });
    const violations = await runAxe(page, ["color-contrast"]);
    await close();
    for (const v of violations) failures.push(`${theme}: ${v.nodes.slice(0, 3).join(", ")}`);
  }
  return { pass: failures.length === 0, detail: failures.length ? failures.join(" | ") : "AA contrast in all themes" };
}

/** F3: decorative glyphs are hidden from assistive tech; a trail marks the current page. */
export async function decorativeGlyphsHidden(browser, { storyId, landmark = "nav" }) {
  const { page, close } = await openStory(browser, storyId);
  const result = await page.evaluate((selector) => {
    const root = document.querySelector("#storybook-root");
    const glyph = /^[/›>|·•»→]$/;
    const exposed = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim();
      if (glyph.test(text) && !walker.currentNode.parentElement.closest('[aria-hidden="true"]')) exposed.push(text);
    }
    const trails = [...root.querySelectorAll(selector)];
    const unmarked = trails.filter((nav) => nav.querySelectorAll('[aria-current="page"]').length !== 1).length;
    return { exposed: exposed.length, trails: trails.length, unmarked };
  }, landmark);
  await close();
  const pass = result.exposed === 0 && result.unmarked === 0;
  return {
    pass,
    detail: pass
      ? `glyphs hidden; ${result.trails} trail(s) mark the current page`
      : `${result.exposed} glyph(s) announced; ${result.unmarked}/${result.trails} trail(s) without one aria-current="page"`,
  };
}

/** F4: every keyboard focus ring stays inside its clipping ancestors. */
export async function focusNotClipped(browser, { storyId, viewport = { width: 1024, height: 800 }, maxStops = 40 }) {
  const { page, close } = await openStory(browser, storyId, { viewport });
  await page.locator("#storybook-root").click({ position: { x: 1, y: 1 } }).catch(() => {});
  const clipped = [];
  for (let i = 0; i < maxStops; i += 1) {
    await page.keyboard.press("Tab");
    const hit = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || !document.querySelector("#storybook-root").contains(el)) return null;
      const cs = getComputedStyle(el);
      const ring = cs.outlineStyle === "none" ? 0 : parseFloat(cs.outlineWidth) + Math.max(0, parseFloat(cs.outlineOffset));
      if (!ring) return { label: el.textContent.trim().slice(0, 30), clipped: false };
      const r = el.getBoundingClientRect();
      const box = { l: r.left - ring, t: r.top - ring, r: r.right + ring, b: r.bottom + ring };
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ps = getComputedStyle(p);
        if (ps.overflowX === "visible" && ps.overflowY === "visible") continue;
        const c = p.getBoundingClientRect();
        const tol = 0.5;
        if (box.l < c.left - tol || box.t < c.top - tol || box.r > c.right + tol || box.b > c.bottom + tol) {
          return { label: el.textContent.trim().slice(0, 30), clipped: true };
        }
      }
      return { label: el.textContent.trim().slice(0, 30), clipped: false };
    });
    if (!hit) break;
    if (hit.clipped) clipped.push(hit.label || "(unlabelled)");
  }
  await close();
  return { pass: clipped.length === 0, detail: clipped.length ? `clipped: ${[...new Set(clipped)].join(", ")}` : "no focus ring clipped" };
}

/**
 * F1/F3 (non-text): a control's moving part stays distinguishable from its
 * track at 3:1 (WCAG 1.4.11) in the given theme, in its on state, both at rest
 * and under the pointer. Only solid rings count (box-shadow with no offset and
 * no blur), alpha-composited over the track; soft drop shadows do not.
 */
export async function partsDistinguishable(browser, { storyId, theme, control = '[role="switch"]', part, track }) {
  const { page, close } = await openStory(browser, storyId, { theme });
  const toggle = page.locator(control).first();
  if ((await toggle.getAttribute("aria-checked")) !== "true") await toggle.click();
  const measure = () =>
    page.evaluate(({ partSel, trackSel }) => {
      const partEl = document.querySelector(partSel);
      const trackEl = document.querySelector(trackSel);
      if (!partEl || !trackEl) return null;
      const ps = getComputedStyle(partEl);
      const rings = [];
      for (const m of ps.boxShadow.matchAll(/(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px\s+([\d.]+)px/g)) {
        const [, color, x, y, blur, spread] = m;
        if (Number(x) === 0 && Number(y) === 0 && Number(blur) === 0 && Number(spread) >= 1) rings.push(color);
      }
      return { part: ps.backgroundColor, rings, track: getComputedStyle(trackEl).backgroundColor };
    }, { partSel: part, trackSel: track });
  const composite = (fg, bg) => {
    const [r, g, b, a = 1] = (fg.match(/[\d.]+/g) ?? []).map(Number);
    const [br, bgG, bb] = (bg.match(/[\d.]+/g) ?? []).map(Number);
    return `rgb(${r * a + br * (1 - a)}, ${g * a + bgG * (1 - a)}, ${b * a + bb * (1 - a)})`;
  };
  const score = (c) => Math.max(contrast(c.part, c.track), ...c.rings.map((ring) => contrast(composite(ring, c.track), c.track)));
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  const rest = await measure();
  await toggle.hover();
  await page.waitForTimeout(400);
  const hover = await measure();
  await close();
  if (!rest || !hover) return { pass: false, error: true, detail: "part or track not found" };
  const [r, h] = [score(rest), score(hover)];
  const findings = [r < 3 ? "rest" : null, h < 3 ? "hover" : null].filter(Boolean);
  return { pass: findings.length === 0, findings, detail: `${theme} on-state part/track: rest ${r.toFixed(2)}:1, hover ${h.toFixed(2)}:1` };
}

/**
 * F9: a container's stylesheet must not repaint the components nested in it.
 * Snapshots the paint of every nested design-system element, removes each
 * rule that names the container's module and reaches past it (a descendant or
 * child combinator), and compares. Any change means the container's CSS styles
 * components it does not own. Fails closed when no container renders.
 *
 * A canary also goes in two levels deep: a span painted by one module class,
 * the specificity every DS component uses. Stories rarely nest a painted
 * component inside every container, so without it a container rule that
 * reaches too far has nothing to clobber and passes unseen.
 */
export async function containerRulesDoNotRepaint(browser, { storyId, container, containerSelector = '[role="dialog"]', openWith }) {
  const { page, close } = await openStory(browser, storyId);
  if (!(await page.locator(containerSelector).count())) {
    const opener = openWith ? page.getByRole("button", { name: openWith }) : page.getByRole("button");
    await opener.first().click().catch(() => {});
    await page.waitForTimeout(800);
  }
  const result = await page.evaluate(({ sel, prefix }) => {
    const root = document.querySelector(sel);
    if (!root) return null;
    const style = document.createElement("style");
    style.textContent = ".DtCanary-module__paint { background-color: rgb(255, 0, 0); color: rgb(0, 128, 0); }";
    document.head.append(style);
    const host = root.querySelector(`[class*="${prefix}-module__content"]`) ?? root;
    const wrap = document.createElement("div");
    const canary = document.createElement("span");
    canary.className = "DtCanary-module__paint";
    canary.textContent = "canary";
    wrap.append(canary);
    host.append(wrap);
    const nested = [...root.querySelectorAll('[class*="-module__"]')].filter((el) => ![...el.classList].some((c) => c.startsWith(`${prefix}-module__`)));
    const canaryPainted = getComputedStyle(canary).backgroundColor === "rgb(255, 0, 0)";
    const snap = () => nested.map((el) => { const cs = getComputedStyle(el); return `${cs.backgroundColor}|${cs.color}`; });
    const before = snap();
    let removed = 0;
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (let i = rules.length - 1; i >= 0; i -= 1) {
        const text = rules[i].selectorText ?? "";
        if (text.includes(`${prefix}-module__`) && /[\s>]/.test(text.replace(/\s*,\s*/g, ","))) { sheet.deleteRule(i); removed += 1; }
      }
    }
    const after = snap();
    const changed = nested
      .map((el, i) => (before[i] !== after[i] ? `${[...el.classList].find((c) => c.includes("-module__")).replace("-module__", ".")}` : null))
      .filter(Boolean);
    if (!canaryPainted && !changed.includes("DtCanary.paint")) changed.push("DtCanary.paint");
    return { nested: nested.length, removed, changed: [...new Set(changed)] };
  }, { sel: containerSelector, prefix: container });
  await close();
  if (!result) return { pass: false, error: true, detail: `no ${containerSelector} rendered in ${storyId}` };
  return {
    pass: result.changed.length === 0,
    findings: result.changed,
    detail: result.changed.length
      ? `${container} rules repaint nested: ${result.changed.slice(0, 6).join(", ")}`
      : `${result.nested} nested elements unaffected by ${result.removed} ${container} rule(s)`,
  };
}

// ---------------------------------------------------------------------------
// generic browser graders (story or page)

async function openTarget(browser, target, { theme, viewport } = {}) {
  if (target.storyId) return openStory(browser, target.storyId, { theme: theme ?? "light", viewport });
  const opened = await openPage(browser, target.url, { theme, contextOptions: viewport ? { viewport } : {} });
  return { page: opened.page, close: opened.close };
}

/**
 * F3 (broad): the WCAG 2.x A/AA axe rules per theme, plus label-in-name
 * (experimental in axe, so enabled explicitly). One grader instead of a rule
 * per defect: held-out bugs rarely match the rule a grader was built around.
 */
export async function axeInThemes(browser, { themes = ["light", "dark", "hcb", "hcw"], ...target }) {
  const failures = [];
  for (const theme of themes) {
    const { page, close } = await openTarget(browser, target, { theme });
    await page.addScriptTag({ content: readFileSync(AXE_SOURCE, "utf8") });
    const violations = await page.evaluate(async (scope) => {
      const result = await window.axe.run(document.querySelector(scope) ?? document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
        rules: { "label-content-name-mismatch": { enabled: true } },
      });
      return result.violations.map((v) => `${v.id}(${v.nodes.length})`);
    }, target.storyId ? "#storybook-root" : "body");
    await close();
    for (const v of violations) failures.push(`${theme}:${v}`);
  }
  return { pass: failures.length === 0, findings: failures, detail: failures.length ? failures.slice(0, 6).join(", ") : `no WCAG A/AA violations in ${themes.join("/")}` };
}

/**
 * F9/F11 (layout): no text is cut off by an overflow-hidden or clip box at any
 * width in the sweep. Intentional truncation (text-overflow: ellipsis,
 * line-clamp) and scrolling containers are allowed.
 */
export async function textNotClipped(browser, { widths = [360, 480, 640, 768, 900, 1024, 1280], ...target }) {
  const clipped = new Map();
  for (const width of widths) {
    const { page, close } = await openTarget(browser, target, { viewport: { width, height: 900 } });
    const hits = await page.evaluate((scope) => {
      const root = document.querySelector(scope) ?? document.body;
      const out = [];
      for (const el of root.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const clipsX = cs.overflowX === "hidden" || cs.overflowX === "clip";
        const clipsY = cs.overflowY === "hidden" || cs.overflowY === "clip";
        if (!clipsX && !clipsY) continue;
        if (cs.textOverflow === "ellipsis" || (cs.webkitLineClamp && cs.webkitLineClamp !== "none")) continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || el.innerText?.trim();
        if (!hasText || el.getClientRects().length === 0) continue;
        const overX = clipsX && el.scrollWidth > el.clientWidth + 1;
        const overY = clipsY && el.scrollHeight > el.clientHeight + 1;
        if (!overX && !overY) continue;
        // Visually hidden helpers (1px boxes) and media frames are not text clipping.
        if (el.clientWidth <= 2 || el.clientHeight <= 2) continue;
        if (el.querySelector("img, video, canvas, svg, iframe") && !el.innerText.trim()) continue;
        out.push(`${el.tagName.toLowerCase()}.${[...el.classList].find((c) => c.includes("module__") || c.includes("_")) ?? ""}`.slice(0, 60));
      }
      return out;
    }, target.storyId ? "#storybook-root" : "main");
    await close();
    for (const hit of hits) clipped.set(hit, [...(clipped.get(hit) ?? []), width]);
  }
  const findings = [...clipped.entries()].map(([el, ws]) => `${el}@${ws.join("/")}`);
  return { pass: findings.length === 0, findings, detail: findings.length ? `clipped: ${findings.slice(0, 4).join(", ")}` : `no clipped text at ${widths.join("/")}px` };
}

// ---------------------------------------------------------------------------
// browser graders (pages, production build)

async function openPage(browser, url, { theme, contextOptions = {}, cookies = [] } = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", ...contextOptions });
  if (cookies.length) await context.addCookies(cookies);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.route("**/monitoring**", (route) => route.fulfill({ status: 200, body: "{}" }));
  await page.goto(url, { waitUntil: "networkidle" });
  if (theme) {
    const cls = { light: "themeLight", dark: "themeDark", hcb: "themeHCB", hcw: "themeHCW" }[theme];
    await page.evaluate(({ c, t }) => {
      const h = document.documentElement;
      h.className = h.className.replace(/\btheme\w+/g, "");
      h.classList.add(c);
      h.dataset.theme = t;
    }, { c: cls, t: theme });
    await page.waitForTimeout(500);
  }
  return { page, errors, close: () => context.close() };
}

/** F1 (graphics): each matched image shows enough pixels at 3:1 against its ground. */
export async function graphicVisible(browser, { url, theme, selector, minShare = 0.02, sample = 6 }) {
  const { page, close } = await openPage(browser, url, { theme });
  const images = page.locator(selector);
  const count = Math.min(await images.count(), sample);
  const invisible = [];
  for (let i = 0; i < count; i += 1) {
    const img = images.nth(i);
    await img.scrollIntoViewIfNeeded().catch(() => {});
    const ground = await img.evaluate((el) => {
      for (let p = el.parentElement; p; p = p.parentElement) {
        const bg = getComputedStyle(p).backgroundColor;
        if (bg && bg !== "transparent" && !/^rgba\(.*,\s*0\)$/.test(bg)) return bg;
      }
      return "rgb(255, 255, 255)";
    });
    const buffer = await img.screenshot().catch(() => null);
    if (!buffer) continue;
    // Decoded in Node: the site's CSP blocks fetch() of data: URLs in-page.
    const png = PNG.sync.read(buffer);
    const lb = luminance(ground);
    let hit = 0;
    for (let k = 0; k < png.data.length; k += 4) {
      const l = luminance(`rgb(${png.data[k]}, ${png.data[k + 1]}, ${png.data[k + 2]})`);
      if ((Math.max(l, lb) + 0.05) / (Math.min(l, lb) + 0.05) >= 3) hit += 1;
    }
    const share = hit / (png.data.length / 4);
    if (share < minShare) invisible.push(`#${i} ${(share * 100).toFixed(1)}%`);
  }
  await close();
  return { pass: count > 0 && invisible.length === 0, detail: count ? (invisible.length ? `invisible in ${theme}: ${invisible.join(", ")}` : `${count} graphic(s) visible in ${theme}`) : "no graphics found" };
}

/**
 * F11: icons inside buttons render at the same size in WebKit (iPhone) as in
 * Chromium at the same viewport. Chromium-only checks are how the iPhone menu
 * icon shipped at 12px while Chrome showed 32px; a declared size cannot be
 * trusted either, because `width="1em"` moves with the very bug it would catch.
 */
export async function iconsMatchAcrossEngines(browserTypes, { url, minRatio = 0.75 }) {
  const { devices } = await import("playwright");
  const iphone = devices["iPhone 15"];
  const sizes = {};
  for (const [engine, type] of Object.entries(browserTypes)) {
    const browser = await type.launch();
    const context = await browser.newContext({
      viewport: iphone.viewport,
      deviceScaleFactor: iphone.deviceScaleFactor,
      ...(engine === "webkit" ? { userAgent: iphone.userAgent, isMobile: true, hasTouch: true } : {}),
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    sizes[engine] = await page.evaluate(() =>
      [...document.querySelectorAll("button svg")].map((svg) => ({
        label: (svg.closest("button").getAttribute("aria-label") ?? "button").slice(0, 30),
        width: svg.getBoundingClientRect().width,
      })),
    );
    await browser.close();
  }
  const small = [];
  sizes.webkit.forEach((icon, i) => {
    const reference = sizes.chromium[i];
    if (reference && reference.width >= 8 && icon.width < reference.width * minRatio) {
      small.push(`${icon.label} ${icon.width.toFixed(0)}px vs ${reference.width.toFixed(0)}px`);
    }
  });
  return { pass: small.length === 0, findings: small, detail: small.length ? `WebKit undersized: ${small.slice(0, 4).join(", ")}` : `${sizes.webkit.length} button icons match across engines` };
}

/** F10/F12: a page loaded N times with a saved language never throws a hydration error. */
export async function noHydrationErrors(browser, { url, language, loads = 14 }) {
  const origin = new URL(url);
  let failed = 0;
  const samples = [];
  for (let i = 0; i < loads; i += 1) {
    const { errors, close } = await openPage(browser, `${url}${url.includes("?") ? "&" : "?"}n=${i}`, {
      cookies: [{ name: "i18next", value: language, domain: origin.hostname, path: "/" }],
    });
    await new Promise((r) => setTimeout(r, 800));
    const hydration = errors.filter((e) => /hydrat|#418|#423|did not match/i.test(e));
    if (hydration.length) {
      failed += 1;
      samples.push(hydration[0].slice(0, 90));
    }
    await close();
  }
  return { pass: failed === 0, detail: failed ? `${failed}/${loads} loads threw: ${samples[0]}` : `0/${loads} loads threw` };
}

// ---------------------------------------------------------------------------
// static graders (file contents at a git revision)

function gitShow(rev, path) {
  return execFileSync("git", ["show", `${rev}:${path}`], { cwd: REPO_ROOT, maxBuffer: 1 << 28 }).toString();
}

/** Files at `rev` under `roots` (prefixes) ending in one of `exts`. ls-tree paths are prefixes, not globs. */
function gitFiles(rev, exts, roots = []) {
  return execFileSync("git", ["ls-tree", "-r", "--name-only", rev, "--", ...roots], { cwd: REPO_ROOT, maxBuffer: 1 << 26 })
    .toString()
    .split("\n")
    .filter((f) => f && exts.some((ext) => f.endsWith(ext)));
}

/** F2: hard phantom tokens (no fallback, defined nowhere) in the given files at `rev`. */
export function phantomTokensInFiles({ rev, files }) {
  const defined = new Set();
  for (const file of gitFiles(rev, [".css"])) {
    if (file.includes("node_modules") || file.includes("/dist/")) continue;
    for (const t of extractCssDefinitions(gitShow(rev, file))) defined.add(t);
  }
  for (const file of gitFiles(rev, [".tsx", ".ts"])) {
    if (file.includes("node_modules") || file.includes("/dist/") || file.endsWith(".d.ts")) continue;
    for (const t of extractTsxDefinitions(gitShow(rev, file))) defined.add(t);
  }
  const refs = new Map();
  for (const file of files) {
    try {
      refs.set(file, extractCssReferences(gitShow(rev, file)));
    } catch {
      // file absent at this revision
    }
  }
  const phantoms = findPhantomTokens(refs, defined);
  const hard = phantoms.filter((p) => p.hard);
  return { pass: hard.length === 0, findings: hard.map((p) => p.token), detail: hard.length ? `${hard.length} hard phantom token(s), e.g. ${hard.slice(0, 3).map((p) => p.token).join(", ")}` : "no hard phantom tokens" };
}

/** F10: every `t("key")` call without a fallback resolves in each locale at `rev`. */
export function untranslatedKeys({ rev, roots = ["nextjs-app", "app"], locales = ["en", "fi", "sv"] }) {
  const sources = gitFiles(rev, [".tsx"], roots).filter((f) => !/\.test\.|\.stories\./.test(f));
  const keys = new Set();
  for (const file of sources) {
    for (const m of gitShow(rev, file).matchAll(/\bt\(\s*["']([a-zA-Z][\w.]*)["']\s*\)/g)) keys.add(m[1]);
  }
  const missing = [];
  for (const locale of locales) {
    const dict = JSON.parse(gitShow(rev, `nextjs-app/shared/locales/${locale}/translation.json`));
    for (const key of keys) {
      const value = key.split(".").reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), dict);
      if (value === undefined && dict[key] === undefined) missing.push(`${locale}:${key}`);
    }
  }
  return { pass: missing.length === 0, findings: missing, detail: missing.length ? `${missing.length} unresolved, e.g. ${missing.slice(0, 4).join(", ")}` : `${keys.size} fallback-less keys resolve in ${locales.join("/")}` };
}

/** F5: copy keyed by a project slug names that project's client and no other. */
export function attributionMatchesRecord({ rev, section = ["engagementPages", "proof"], field = "eyebrow", locales = ["en", "fi", "sv"] }) {
  const source = gitShow(rev, "nextjs-app/shared/data/projects.ts");
  const records = [...source.matchAll(/slug:\s*"([^"]+)"[\s\S]*?(?=slug:|$)/g)].map((m) => ({
    slug: m[1],
    client: (m[0].match(/\bclient:\s*"([^"]+)"/) ?? [])[1],
  }));
  const problems = [];
  for (const locale of locales) {
    const dict = JSON.parse(gitShow(rev, `nextjs-app/shared/locales/${locale}/translation.json`));
    const entries = section.reduce((node, part) => node?.[part], dict) ?? {};
    for (const [slug, copy] of Object.entries(entries)) {
      const text = copy?.[field];
      if (typeof text !== "string") continue;
      const own = records.find((r) => r.slug === slug);
      // Client names are localised (City of Helsinki / Helsingin kaupunki), so
      // "names its own client" is checked in English; "names another project's
      // client" is checked in every locale.
      if (!own) problems.push(`${locale}:${slug} has no project record`);
      else if (locale === "en" && own.client && !text.includes(own.client)) problems.push(`${locale}:${slug} omits ${own.client}`);
      for (const other of records) {
        if (other.slug !== slug && other.client && other.client !== own?.client && text.includes(other.client)) problems.push(`${locale}:${slug} names ${other.client}`);
      }
    }
  }
  return { pass: problems.length === 0, findings: problems, detail: problems.length ? problems.slice(0, 4).join(" | ") : "every credit matches its project record" };
}

/** F6: the lockfile installs on linux/amd64 the way Vercel installs it. */
export function lockfileInstallsOnLinux({ rev }) {
  const dir = mkdtempSync(join(tmpdir(), "dt-lock-"));
  try {
    writeFileSync(join(dir, "package.json"), gitShow(rev, "package.json"));
    writeFileSync(join(dir, "package-lock.json"), gitShow(rev, "package-lock.json"));
    execFileSync("docker", ["run", "--rm", "--platform=linux/amd64", "-v", `${dir}:/w:ro`, "-w", "/w", "node:24", "npm", "ci", "--dry-run", "--ignore-scripts", "--legacy-peer-deps"], { stdio: "pipe", maxBuffer: 1 << 26 });
    return { pass: true, detail: "npm ci --dry-run passes on linux/amd64" };
  } catch (error) {
    const out = `${error.stdout ?? ""}${error.stderr ?? ""}`;
    const line = out.split("\n").find((l) => /EUSAGE|Missing:|ERR/.test(l)) ?? out.slice(-160);
    return { pass: false, detail: line.trim().slice(0, 160) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * F5 (broad): any copy whose key path names a project slug (kebab or camel
 * case) must not name another project's client, in any locale.
 */
export function attributionInAllCopy({ rev, locales = ["en", "fi", "sv"] }) {
  const source = gitShow(rev, "nextjs-app/shared/data/projects.ts");
  const records = [...source.matchAll(/slug:\s*"([^"]+)"[\s\S]*?(?=slug:|$)/g)]
    .map((m) => ({ slug: m[1], client: (m[0].match(/\bclient:\s*"([^"]+)"/) ?? [])[1] }))
    .filter((r) => r.client);
  const camel = (slug) => slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  const problems = [];
  for (const locale of locales) {
    const walk = (node, path) => {
      if (typeof node === "string") {
        const lower = path.toLowerCase();
        for (const own of records) {
          if (!lower.includes(own.slug) && !lower.includes(camel(own.slug).toLowerCase())) continue;
          for (const other of records) {
            if (other.client !== own.client && node.includes(other.client)) problems.push(`${locale}:${path} (${own.slug}) names ${other.client}`);
          }
        }
        return;
      }
      if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k);
    };
    walk(JSON.parse(gitShow(rev, `nextjs-app/shared/locales/${locale}/translation.json`)), "");
  }
  return { pass: problems.length === 0, findings: problems, detail: problems.length ? problems.slice(0, 3).join(" | ") : "no copy names another project's client" };
}

