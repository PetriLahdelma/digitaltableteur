#!/usr/bin/env node
/**
 * Custom ASCII banner for ESLint
 * Bug-catching themed banners before and after linting
 */

import { spawn } from "child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve the locally-installed eslint binary so we never pull a transient
// network copy via bare `npx eslint`. The script lives at scripts/lint-banner.mjs,
// so the project root is one level up.
const localEslintBin = path.resolve(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  "eslint",
);

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const startBanner = `
${YELLOW}
    BUG PATROL ACTIVATED

         (o_o)
         <| |>   ${CYAN}"Searching for bugs..."${RESET}${YELLOW}
         _/ \\_

    ${DIM}Every bug you squash is a user who doesn't cry.${RESET}
`;

const successBanner = `
${GREEN}
    NO BUGS DETECTED!

         \\(^_^)/
          <| |>   "Code is squeaky clean!"
          _/ \\_

    ${DIM}The bugs looked at your code and fled in terror.${RESET}
`;

const errorBanner = `
${RED}
    BUGS FOUND!

         (>_<)
         <| |>   "Time to squash some bugs..."
         _/ \\_

    ${DIM}Don't worry, even the best code has a few stowaways.${RESET}
`;

console.log(startBanner);

const eslintArgs = process.argv.slice(2);
const eslintTargets = eslintArgs.length > 0 ? eslintArgs : ["."];
const eslint = spawn(localEslintBin, eslintTargets, {
  stdio: "inherit",
  shell: false,
});

eslint.on("close", (code, signal) => {
  if (code === 0) {
    console.log(successBanner);
  } else {
    if (signal) {
      console.error(`ESLint exited after receiving ${signal}.`);
    }
    console.log(errorBanner);
  }
  process.exit(code ?? 1);
});

eslint.on("error", (err) => {
  console.error("Failed to run ESLint:", err);
  process.exit(1);
});
