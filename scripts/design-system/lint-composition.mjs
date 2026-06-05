#!/usr/bin/env node
/**
 * Lint incompatible @dt composition pairs on product surfaces.
 *
 *   npm run lint:composition
 *   npm run lint:composition -- --strict
 */
import { scanCompositionViolations } from "./composition-lint-lib.mjs";

const strict = process.argv.includes("--strict");
const violations = scanCompositionViolations();

if (!violations.length) {
  console.log(
    "✓ lint:composition — no incompatible @dt import pairs in product surfaces",
  );
  process.exit(0);
}

const label = strict ? "error" : "warning";
for (const v of violations) {
  console[strict ? "error" : "warn"](
    `${label}: ${v.file} — ${v.id} (${v.components.join(" + ")}): ${v.message}`,
  );
}

if (strict) {
  console.error(`\nlint:composition: ${violations.length} violation(s)`);
  process.exit(1);
}

console.log(`\nlint:composition: ${violations.length} warning(s) (pass --strict to fail CI)`);
process.exit(0);
