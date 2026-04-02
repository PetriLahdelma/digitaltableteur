#!/usr/bin/env node
/**
 * VertaaUX Portfolio Refresh Score
 * Counts stale brand references. LOWER is better. 0 = fully refreshed.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const pagePath = resolve(root, "nextjs-app/shared/components/pages/Work/VertaaUX/VertaaUXPage.tsx");
const cssPath = resolve(root, "nextjs-app/shared/components/pages/Work/VertaaUX/vertaaux.module.css");
const projectsPath = resolve(root, "nextjs-app/shared/data/projects.ts");

const page = readFileSync(pagePath, "utf-8");
const css = readFileSync(cssPath, "utf-8");
const projects = readFileSync(projectsPath, "utf-8");

let staleCount = 0;
const issues = [];

function stale(reason) {
  staleCount++;
  issues.push(reason);
}

// --- OLD BRAND COLORS ---
// Portfolio uses purple-blue gradients that are now wrong
if (css.includes("#667eea") || css.includes("#764ba2")) stale("Old gradient colors #667eea/#764ba2 in CSS");
if (css.includes("linear-gradient") && (css.includes("667eea") || css.includes("764ba2"))) stale("Old gradient in CSS");

// --- OLD IMAGES ---
if (page.includes("computer-mockup-on-colorful-background")) stale("Old colorful mockup image still referenced");
if (page.includes("macbook-pro-gradient")) stale("Old MacBook gradient mockup still referenced");
if (page.includes("macbook-pro-clay-dark")) stale("Old clay MacBook still referenced");
if (page.includes("gradient-logo@2x")) stale("Old gradient logo still referenced");
if (page.includes("black-logo@2x")) stale("Old black logo still referenced (should use press-kit version)");
if (page.includes("white-logo@2x")) stale("Old white logo still referenced (should use press-kit version)");
if (page.includes("round-logo-gradient@2x")) stale("Old round gradient logo still referenced");

// --- MISSING NEW SCREENSHOTS ---
if (!page.includes("screenshot-dashboard")) stale("Missing: dashboard screenshot");
if (!page.includes("screenshot-audit-results")) stale("Missing: audit results screenshot");
if (!page.includes("screenshot-detailed-analysis")) stale("Missing: detailed analysis screenshot");
if (!page.includes("shot-app-results-overview") && !page.includes("screenshot-audit-results")) stale("Missing: app results overview shot");

// --- STALE COPY ---
if (page.includes("predictive UX intelligence engine")) stale("Old positioning copy: 'predictive UX intelligence engine'");
if (page.includes("one-click audits for usability, accessibility, and conversion")) stale("Old description still present");
if (!page.includes("#00FFCC") && !page.includes("00FFCC") && !css.includes("#00FFCC") && !css.includes("00FFCC")) stale("New brand color #00FFCC not used anywhere");
if (!page.includes("Geist")) stale("No mention of Geist typography in brand identity section");

// --- POSITIONING ---
if (!page.includes("craft") && !page.includes("not compliance") && !page.includes("dev teams")) stale("New positioning language missing ('craft, not compliance' / 'dev teams')");
if (!page.includes("Evidence-First") && !page.includes("evidence-first")) stale("Brand pillar 'Evidence-First' missing");

// --- STALE METRICS ---
// Current page says 40-90s but product has evolved
if (page.includes("40-90s")) stale("Audit speed may be outdated (was 40-90s)");

// --- THUMBNAIL ---
if (projects.includes("thumbnail@2x 2.png")) stale("Projects.ts thumbnail uses old image with space in filename");

// --- MISSING BRAND SECTIONS ---
if (!page.includes("#0D0D0D") && !page.includes("0D0D0D") && !css.includes("#0D0D0D")) stale("New dark base color #0D0D0D not in CSS");
if (!page.includes("#141414") && !css.includes("#141414")) stale("New card surface #141414 not in CSS");

// --- OUTPUT ---
console.log("=== VertaaUX Portfolio Refresh Score ===\n");
console.log(`STALE ITEMS: ${staleCount} (lower is better, 0 = done)\n`);
for (const issue of issues) {
  console.log(`  ✗ ${issue}`);
}
if (staleCount === 0) {
  console.log("  ✓ All brand references up to date!");
}
console.log(`\nSCORE: ${staleCount}`);
