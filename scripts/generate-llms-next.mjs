#!/usr/bin/env node
/**
 * Fetches the Next.js llms.txt output (app/llms.txt/route.ts) and writes it to nextjs-app/public/llms.txt.
 * Keeps the legacy script intact.
 */
import fs from "fs";
import path from "path";
import https from "https";
import url from "url";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://digitaltableteur.com";
const TARGET = url.resolve(BASE, "/llms.txt");
const OUTPUT = path.join(process.cwd(), "nextjs-app/public/llms.txt");

function fetchToString(target) {
  return new Promise((resolve, reject) => {
    https
      .get(target, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Request failed ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function main() {
  try {
    const txt = await fetchToString(TARGET);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, txt, "utf8");
    console.log(`Wrote Next llms.txt to ${OUTPUT}`);
  } catch (err) {
    console.error("Failed to fetch Next llms.txt:", err);
    process.exit(1);
  }
}

main();
