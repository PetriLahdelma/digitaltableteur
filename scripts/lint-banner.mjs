#!/usr/bin/env node
/**
 * Custom ASCII banner for ESLint
 * Bug-catching themed banners before and after linting
 */

import { spawn } from "child_process";

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

// Run ESLint and capture exit code
const eslint = spawn("npx", ["eslint", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
});

eslint.on("close", (code) => {
  if (code === 0) {
    console.log(successBanner);
  } else {
    console.log(errorBanner);
  }
  process.exit(code);
});

eslint.on("error", (err) => {
  console.error("Failed to run ESLint:", err);
  process.exit(1);
});
