#!/usr/bin/env node
/**
 * Guard against a static `public/sitemap.xml` file shadowing Next.js MetadataRoute
 * (`app/sitemap.ts`). If the file exists, it is removed.
 *
 * This prevents deployment situations where an older generated sitemap.xml ends up
 * in `public/` and hides the updated programmatic sitemap (including /pseo pages).
 */
import fs from "fs";
import path from "path";

const target = path.join(process.cwd(), "public", "sitemap.xml");

if (fs.existsSync(target)) {
  fs.unlinkSync(target);
  // eslint-disable-next-line no-console
  console.log(
    `[sitemap] Removed static public/sitemap.xml to avoid conflict with app/sitemap.ts`,
  );
}

