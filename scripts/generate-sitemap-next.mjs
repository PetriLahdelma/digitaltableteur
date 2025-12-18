#!/usr/bin/env node
/**
 * Fetches the Next.js sitemap (app/sitemap.ts) and writes it to a non-conflicting
 * file under nextjs-app/public/.
 *
 * IMPORTANT:
 * - Do NOT write to `public/sitemap.xml` because it can shadow Next.js MetadataRoute
 *   (`app/sitemap.ts`) and cause stale/partial sitemaps in production.
 */
import fs from "fs";
import path from "path";
import https from "https";
import url from "url";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://digitaltableteur.com";
const TARGET = url.resolve(BASE, "/sitemap.xml");
const OUTPUT = path.join(process.cwd(), "nextjs-app/public/sitemap-next.xml");

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
    const xml = await fetchToString(TARGET);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, xml, "utf8");
    console.log(`Wrote Next sitemap to ${OUTPUT}`);
  } catch (err) {
    console.error("Failed to fetch Next sitemap:", err);
    process.exit(1);
  }
}

main();
