#!/usr/bin/env node

/**
 * Translation Validation Script
 *
 * Compares all language files against the English (EN) source and reports:
 * - Missing keys in FI and SV
 * - Extra keys in FI and SV (not errors, but informational)
 * - Translation key counts per language
 *
 * Usage: node scripts/validate-translations.mjs
 * Exit code: 0 if all translations complete, 1 if missing keys found
 *
 * Created: Phase 12-2 Launch Preparation
 */

import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(__dirname, "../nextjs-app/shared/locales");
const legacyLocalesDir = resolve(__dirname, "../shared/locales");
const languages = ["en", "fi", "sv"];

/**
 * Recursively extracts all keys from a nested JSON object
 * @param {object} obj - The translation object
 * @param {string} prefix - Current key prefix for nested keys
 * @returns {string[]} Array of dot-notation key paths
 */
function getAllKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    // Skip arrays (like homeHeroGradientTitleOptions) as they're not translatable keys
    if (Array.isArray(v)) {
      return [key];
    }
    return typeof v === "object" && v !== null ? getAllKeys(v, key) : [key];
  });
}

/**
 * Loads a translation JSON file
 * @param {string} lang - Language code (en, fi, sv)
 * @returns {object} Parsed translation object
 */
function loadTranslation(lang) {
  const filePath = resolve(localesDir, lang, "translation.json");
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error(`Error loading ${lang}/translation.json:`, error.message);
    process.exit(1);
  }
}

const legacyTranslationFiles = languages
  .map((lang) => resolve(legacyLocalesDir, lang, "translation.json"))
  .filter((filePath) => existsSync(filePath));

if (legacyTranslationFiles.length > 0) {
  console.error("FAIL: legacy translation mirror still exists.");
  console.error(
    "Use nextjs-app/shared/locales/{en,fi,sv}/translation.json as the canonical source."
  );
  legacyTranslationFiles.forEach((filePath) => {
    console.error(`  - ${filePath}`);
  });
  process.exit(1);
}

// Load all translation files
console.log("Loading translation files...\n");
const en = loadTranslation("en");
const fi = loadTranslation("fi");
const sv = loadTranslation("sv");

// Extract all keys
const enKeys = new Set(getAllKeys(en));
const fiKeys = new Set(getAllKeys(fi));
const svKeys = new Set(getAllKeys(sv));

// Find missing keys in each language
const missingFi = [...enKeys].filter((k) => !fiKeys.has(k));
const missingSv = [...enKeys].filter((k) => !svKeys.has(k));

// Find extra keys (not in EN)
const extraFi = [...fiKeys].filter((k) => !enKeys.has(k));
const extraSv = [...svKeys].filter((k) => !enKeys.has(k));

// Report results
console.log("=== Translation Coverage Report ===\n");
console.log(`English (EN):  ${enKeys.size} keys (source)`);
console.log(`Finnish (FI):  ${fiKeys.size} keys`);
console.log(`Swedish (SV):  ${svKeys.size} keys\n`);

let hasErrors = false;

if (missingFi.length > 0) {
  hasErrors = true;
  console.log(`Missing in Finnish (${missingFi.length}):`);
  missingFi.forEach((k) => console.log(`  - ${k}`));
  console.log();
}

if (missingSv.length > 0) {
  hasErrors = true;
  console.log(`Missing in Swedish (${missingSv.length}):`);
  missingSv.forEach((k) => console.log(`  - ${k}`));
  console.log();
}

// Extra keys are ERRORS, not information: a key that exists in FI/SV but
// not in EN means either (a) a feature shipped with translations but no
// English source string — the component renders the raw key in English
// (2026-08-05 contact-form incident: contactFollowUpPreferencesLabel /
// contactFollowUpCallPrep) — or (b) dead keys that drifted. Both need
// fixing, so symmetry failures now gate.
if (extraFi.length > 0) {
  hasErrors = true;
  console.log(`Keys in Finnish but MISSING FROM ENGLISH (${extraFi.length}):`);
  extraFi.forEach((k) => console.log(`  - ${k}`));
  console.log();
}

if (extraSv.length > 0) {
  hasErrors = true;
  console.log(`Keys in Swedish but MISSING FROM ENGLISH (${extraSv.length}):`);
  extraSv.forEach((k) => console.log(`  - ${k}`));
  console.log();
}

// Final status
if (hasErrors) {
  console.log("FAIL: Translation coverage incomplete or asymmetric");
  console.log(
    "Add missing keys (including to EN, the source language) or remove dead keys.",
  );
  process.exit(1);
} else {
  console.log("PASS: All translations complete!");
  console.log(
    `FI: ${fiKeys.size}/${enKeys.size} (${((fiKeys.size / enKeys.size) * 100).toFixed(1)}%)`
  );
  console.log(
    `SV: ${svKeys.size}/${enKeys.size} (${((svKeys.size / enKeys.size) * 100).toFixed(1)}%)`
  );
  process.exit(0);
}
