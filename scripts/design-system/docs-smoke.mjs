#!/usr/bin/env node
/**
 * Docs-frame smoke gate (Astryx Phase 2, spec 3.4).
 *
 * Visits each proven component's autodocs page and asserts the DT docs
 * frame rendered exactly the blocks its contract implies. Catches
 * contract/story/frame mismatches the unit layer cannot see (the Vitest
 * CSS-module-proxy lesson: render tests cannot notice a docs page that
 * silently dropped a section).
 *
 * Target: a running Storybook (TARGET_URL, default http://localhost:6010).
 * Start one with `npm run storybook` or serve storybook-static.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = process.env.TARGET_URL || "http://localhost:6010";

/** Components proven on the frame; grows with Phase 3 category batches. */
const PROVEN = [
  { name: "Button", docsId: "actions-button--docs" },
  { name: "IconButton", docsId: "actions-iconbutton--docs" },
  { name: "SplitButton", docsId: "actions-splitbutton--docs" },
  { name: "Badge", docsId: "content-badge--docs" },
  { name: "Icon", docsId: "content-icon--docs" },
  { name: "Text", docsId: "content-text--docs" },
  { name: "Title", docsId: "content-title--docs" },
  { name: "Link", docsId: "navigation-link--docs" },
  { name: "Label", docsId: "forms-label--docs" },
  { name: "HelperText", docsId: "forms-helpertext--docs" },
  { name: "GroupLabel", docsId: "forms-grouplabel--docs" },
  { name: "FormField", docsId: "forms-formfield--docs" },
  { name: "TextInput", docsId: "forms-textinput--docs" },
  { name: "TextArea", docsId: "forms-textarea--docs" },
  { name: "Select", docsId: "forms-select--docs" },
  { name: "Checkbox", docsId: "forms-checkbox--docs" },
  { name: "CheckboxGroup", docsId: "forms-checkboxgroup--docs" },
  { name: "Radio", docsId: "forms-radio--docs" },
  { name: "RadioGroup", docsId: "forms-radiogroup--docs" },
  { name: "Switch", docsId: "forms-switch--docs" },
  { name: "Combobox", docsId: "forms-combobox--docs" },
  { name: "MultiCombobox", docsId: "forms-multicombobox--docs" },
  { name: "PhoneInput", docsId: "forms-phoneinput--docs" },
  { name: "FileUpload", docsId: "forms-fileupload--docs" },
  { name: "Card", docsId: "layout-card--docs" },
  { name: "Kbd", docsId: "content-kbd--docs" },
  { name: "StatusDot", docsId: "feedback-statusdot--docs" },
  { name: "EmptyState", docsId: "content-emptystate--docs" },
  { name: "ButtonGroup", docsId: "actions-buttongroup--docs" },
  { name: "AvatarGroup", docsId: "content-avatargroup--docs" },
];

function contractFor(name) {
  const path = resolve(
    ROOT,
    `nextjs-app/shared/components/${name}/${name}.contract.json`,
  );
  return JSON.parse(readFileSync(path, "utf-8"));
}

/** Mirror of DtDocsPage's render conditions, from contract data alone. */
function expectedBlocks(contract) {
  const blocks = ["doc-header", "showcase", "import", "props"];
  if (contract.usage?.description) blocks.push("usage");
  if ((contract.usage?.bestPractices ?? []).length > 0) blocks.push("best-practices");
  if ((contract.usage?.anatomy ?? []).length > 0) blocks.push("anatomy");
  // examples presence is asserted separately via count > 0 (story tags,
  // not contract data, decide it).
  blocks.push("examples");
  const hasTheming =
    (contract.theming?.vars ?? []).length > 0 ||
    Object.values(contract.tokens ?? {}).some((list) => (list ?? []).length > 0);
  if (hasTheming) blocks.push("theming");
  if (contract.a11y) blocks.push("a11y");
  if ((contract.composesWith ?? []).length > 0) blocks.push("related");
  return blocks;
}

const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (err) => pageErrors.push(String(err).slice(0, 200)));

let failed = false;
const rows = [];

for (const { name, docsId } of PROVEN) {
  const contract = contractFor(name);
  const expected = new Set(expectedBlocks(contract));
  await page.goto(`${BASE}/iframe.html?viewMode=docs&id=${docsId}`, {
    waitUntil: "domcontentloaded",
  });
  let rendered = [];
  try {
    await page.waitForSelector("[data-doc-block='doc-header']", {
      timeout: 45000,
    });
    // Give lazy example canvases a beat to mount.
    await page.waitForTimeout(1500);
    rendered = await page.$$eval("[data-doc-block]", (els) =>
      els.map((el) => el.getAttribute("data-doc-block")),
    );
  } catch {
    rows.push({ name, ok: false, detail: "doc-header never rendered" });
    failed = true;
    continue;
  }
  const renderedSet = new Set(rendered);
  const missing = [...expected].filter((b) => !renderedSet.has(b));
  const unexpected = [...renderedSet].filter((b) => !expected.has(b));
  const exampleCount = await page.$$eval(
    "[data-doc-block='examples'] article",
    (els) => els.length,
  ).catch(() => 0);
  const overlayVisible = await page
    .$eval(
      ".sb-errordisplay",
      (el) => getComputedStyle(el).display !== "none",
    )
    .catch(() => false);

  const problems = [];
  if (missing.length) problems.push(`missing: ${missing.join(", ")}`);
  if (unexpected.length) problems.push(`unexpected: ${unexpected.join(", ")}`);
  if (exampleCount < 3) problems.push(`only ${exampleCount} examples (need >=3)`);
  if (overlayVisible) problems.push("storybook error overlay visible");

  const ok = problems.length === 0;
  if (!ok) failed = true;
  rows.push({
    name,
    ok,
    detail: ok
      ? `${rendered.length} blocks, ${exampleCount} examples`
      : problems.join("; "),
  });
}

await browser.close();

for (const row of rows) {
  console.log(`${row.ok ? "✓" : "✗"} ${row.name.padEnd(8)} ${row.detail}`);
}
if (pageErrors.length) {
  console.log("page errors:", pageErrors.slice(0, 5));
  failed = true;
}
if (failed) {
  console.error("\ndocs-smoke: FAILED");
  process.exit(1);
}
console.log("\ndocs-smoke: all proven docs pages render their frame");
