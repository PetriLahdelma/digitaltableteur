#!/usr/bin/env node
/**
 * Verify that npm can exchange the current CI OIDC identity for a publish token.
 *
 * npm treats OIDC as an optional auth path and otherwise falls through to the
 * normal "need auth" publish error. This workflow-only guard makes that failure
 * explicit before the real publish step.
 */
import { spawnSync } from "node:child_process";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE_DIRS = new Map([
  ["@digitaltableteur/tokens", "packages/tokens"],
  ["@digitaltableteur/tokens-css", "packages/tokens-css"],
  ["@digitaltableteur/react", "packages/react"],
]);

const packageName = process.argv[2] ?? "@digitaltableteur/react";
const packageDir = PACKAGE_DIRS.get(packageName);

if (!packageDir) {
  console.error(
    `Unknown package ${packageName}. Expected one of: ${[...PACKAGE_DIRS.keys()].join(", ")}`,
  );
  process.exit(1);
}

if (process.env.GITHUB_ACTIONS !== "true") {
  console.error("npm OIDC publish auth guard must run inside GitHub Actions.");
  process.exit(1);
}

const missingGitHubOidcEnv = [
  "ACTIONS_ID_TOKEN_REQUEST_URL",
  "ACTIONS_ID_TOKEN_REQUEST_TOKEN",
].filter((key) => !process.env[key]);

if (missingGitHubOidcEnv.length) {
  console.error(
    `GitHub OIDC environment is unavailable; missing ${missingGitHubOidcEnv.join(", ")}.`,
  );
  console.error("Ensure the workflow has permissions: id-token: write.");
  process.exit(1);
}

const result = spawnSync(
  "npm",
  ["publish", "--dry-run", "--access", "restricted", "--loglevel", "silly"],
  {
    cwd: join(ROOT, packageDir),
    encoding: "utf8",
    env: process.env,
  },
);

const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
const diagnosticLines = combinedOutput
  .split(/\r?\n/)
  .filter((line) => /oidc|id_token|need auth|ENEEDAUTH|auth/i.test(line))
  .map((line) =>
    line
      .replace(/Bearer\s+[-._~+/=A-Za-z0-9]+/g, "Bearer [redacted]")
      .replace(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[jwt-redacted]"),
  );

const hasOidcSuccess = diagnosticLines.some((line) =>
  /oidc.*Successfully retrieved and set token/i.test(line),
);

if (!hasOidcSuccess) {
  console.error(`npm did not exchange GitHub OIDC for a publish token for ${packageName}.`);
  if (diagnosticLines.length) {
    console.error("Relevant npm diagnostics:");
    for (const line of diagnosticLines) console.error(`  ${line}`);
  } else {
    console.error("No npm OIDC diagnostics were emitted.");
  }
  console.error(
    "Check the npm Trusted Publisher fields: GitHub owner PetriLahdelma, repository digitaltableteur, workflow filename ds-publish.yml, blank environment unless the workflow sets one, and Allow npm publish enabled.",
  );
  process.exit(1);
}

if (result.status !== 0) {
  console.error(
    `npm OIDC token exchange succeeded for ${packageName}, but publish dry-run exited ${result.status}.`,
  );
  for (const line of diagnosticLines) console.error(`  ${line}`);
  process.exit(result.status ?? 1);
}

console.log(
  `✓ npm OIDC publish auth verified for ${packageName} (${relative(ROOT, join(ROOT, packageDir))})`,
);
