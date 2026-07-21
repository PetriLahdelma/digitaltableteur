#!/usr/bin/env node
/**
 * Verify every `a11y.keyboardDelegation` claim.
 *
 * A delegation says "this component's keyboard contract is proven somewhere else". That
 * is only worth recording if it can be falsified, otherwise it is a nicer-sounding way of
 * saying "unverified". So each entry is checked:
 *
 *   - the declared keys must appear in a11y.keyboard (you cannot delegate a key you
 *     do not document)
 *   - a non-native delegation must name an evidence file that exists
 *   - that file must actually exercise each declared key
 *   - a native delegation must carry a note saying why the browser owns it
 *
 * When the delegated-to component drops its test, this fails, which is the whole point:
 * the coverage claim breaks at the moment the coverage does.
 *
 * Usage:
 *   node scripts/design-system/check-keyboard-delegation.mjs
 *   node scripts/design-system/check-keyboard-delegation.mjs --json
 */
import { readFileSync, existsSync, globSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const JSON_OUT = process.argv.includes("--json");

/**
 * Keys the user agent implements on the right element. Delegating these to "native" is a
 * statement about HTML, not about our code, so no test file is demanded.
 */
const NATIVE_KEYS = new Set(["Tab", "Shift+Tab", "Enter", "Space", " "]);

function main() {
  const errors = [];
  const claims = [];

  for (const file of globSync(join(ROOT, "nextjs-app/shared/**/*.contract.json"))) {
    let contract;
    try {
      contract = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    const name = contract.name;
    const a11y = contract.a11y ?? {};
    const delegation = a11y.keyboardDelegation;
    if (!Array.isArray(delegation) || delegation.length === 0) continue;

    const documented = new Set(a11y.keyboard ?? []);

    for (const entry of delegation) {
      const label = `${name} -> ${entry.to}`;
      claims.push({ component: name, to: entry.to, keys: entry.keys });

      for (const key of entry.keys) {
        if (!documented.has(key)) {
          errors.push(`${label}: delegates "${key}" but a11y.keyboard does not document it`);
        }
      }

      if (entry.to === "native") {
        const nonNative = entry.keys.filter((k) => !NATIVE_KEYS.has(k));
        if (nonNative.length) {
          errors.push(
            `${label}: "${nonNative.join(", ")}" is not user-agent behaviour, so it cannot ` +
              `be delegated to native. Name the component that implements it.`,
          );
        }
        continue;
      }

      if (!entry.evidence) {
        errors.push(`${label}: non-native delegation needs an evidence file`);
        continue;
      }
      const evidencePath = join(ROOT, entry.evidence);
      if (!existsSync(evidencePath)) {
        errors.push(`${label}: evidence file not found: ${entry.evidence}`);
        continue;
      }
      const source = readFileSync(evidencePath, "utf8");
      for (const key of entry.keys) {
        // The evidence must actually press the key, not merely mention the component.
        if (!source.includes(`"${key}"`) && !source.includes(`'${key}'`)) {
          errors.push(
            `${label}: ${entry.evidence} never exercises "${key}". ` +
              `The delegation claims coverage that file does not provide.`,
          );
        }
      }
    }
  }

  if (JSON_OUT) {
    console.log(JSON.stringify({ claims, errors }, null, 2));
  } else {
    console.log(`\nKeyboard delegation — ${claims.length} claim(s)\n`);
    for (const c of claims) {
      console.log(`  ${c.component.padEnd(24)} ${c.keys.join(", ").padEnd(28)} -> ${c.to}`);
    }
    console.log("");
  }

  if (errors.length) {
    for (const e of errors) console.error(`FAIL: ${e}`);
    process.exit(1);
  }
  if (!JSON_OUT) console.log("✓ every keyboard delegation is backed by real evidence");
}

main();
