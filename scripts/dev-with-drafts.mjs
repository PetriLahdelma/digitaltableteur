#!/usr/bin/env node
/**
 * Start dev with draft + scheduled-future posts visible.
 * Sets env for blog manifest generation and Next.js runtime.
 */
import { spawn } from "node:child_process";

const env = {
  ...process.env,
  SHOW_UNPUBLISHED_POSTS: "true",
  NEXT_PUBLIC_SHOW_UNPUBLISHED_POSTS: "true",
};

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });

console.log("\n  Draft preview: ON (SHOW_UNPUBLISHED_POSTS + NEXT_PUBLIC_*)\n");
console.log("  Toggle in browser: http://localhost:3001/blog?preview=drafts");
console.log("  Turn off:          http://localhost:3001/blog?preview=off\n");

await run("npm", ["run", "generate:blog"]);
await run("npm", ["run", "dev"]);
