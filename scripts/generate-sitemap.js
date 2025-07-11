const fs = require("fs");
const path = require("path");

const BASE_URL = "https://digitaltableteur.com";
const PAGES_DIR = path.join(__dirname, "../src/pages");

// Recursively scan pages directory for .tsx files (excluding files starting with _ or [)
function getPageRoutes(dir, prefix = "") {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      routes = routes.concat(
        getPageRoutes(path.join(dir, entry.name), prefix + "/" + entry.name),
      );
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".tsx") &&
      !entry.name.startsWith("_") &&
      !entry.name.startsWith("[")
    ) {
      let route =
        prefix +
        "/" +
        entry.name.replace(/index\.tsx$/, "").replace(/\.tsx$/, "");
      route = route.replace(/\/+/g, "/"); // Remove duplicate slashes
      if (route === "") route = "/";
      routes.push(route);
    }
  }
  return routes;
}

// Hardcoded routes for special/dynamic pages
const EXTRA_ROUTES = [
  "/cookie-policy-full",
  "/cookie-policy-full-fi",
  "/cookie-policy-full-sv",
  // Blog posts
  "/blog/designing-in-2025",
  "/blog/workflow-tips",
  "/blog/digital-craftsmanship",
  "/blog/thoughts-on-future-branding",
  "/blog/figma-mcp-design-systems",
  "/blog/petri-lahdelma-bio",
  // Work pages
  "/work/new-things-co",
  "/work/illustrations",
  "/garage-junction",
];

let ROUTES = getPageRoutes(PAGES_DIR);
ROUTES = Array.from(new Set([...ROUTES, ...EXTRA_ROUTES]));

const PRIORITY = {
  "/": "1.0",
  "/about": "0.8",
  "/contact": "0.8",
  "/blog": "0.8",
  "/work": "0.8",
  "/cookie-policy-full": "0.5",
  "/cookie-policy-full-fi": "0.5",
  "/cookie-policy-full-sv": "0.5",
  "/blog/designing-in-2025": "0.6",
  "/blog/workflow-tips": "0.6",
  "/blog/digital-craftsmanship": "0.6",
  "/blog/thoughts-on-future-branding": "0.6",
  "/blog/figma-mcp-design-systems": "0.6",
  "/blog/petri-lahdelma-bio": "0.6",
  "/work/new-things-co": "0.7",
  "/work/illustrations": "0.7",
  "/garage-junction": "0.7",
};
const CHANGEFREQ = {
  "/": "daily",
  "/about": "monthly",
  "/contact": "monthly",
  "/blog": "weekly",
  "/work": "monthly",
  "/cookie-policy-full": "yearly",
  "/cookie-policy-full-fi": "yearly",
  "/cookie-policy-full-sv": "yearly",
  "/blog/designing-in-2025": "yearly",
  "/blog/workflow-tips": "yearly",
  "/blog/digital-craftsmanship": "yearly",
  "/blog/thoughts-on-future-branding": "yearly",
  "/blog/figma-mcp-design-systems": "yearly",
  "/blog/petri-lahdelma-bio": "yearly",
  "/work/new-things-co": "yearly",
  "/work/illustrations": "yearly",
  "/garage-junction": "yearly",
};

const today = new Date().toISOString().slice(0, 10);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ROUTES.map(
    (route) =>
      `  <url>\n    <loc>${BASE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${CHANGEFREQ[route] || "yearly"}</changefreq>\n    <priority>${PRIORITY[route] || "0.5"}</priority>\n  </url>`,
  ),
  "</urlset>",
].join("\n");

fs.writeFileSync(path.join(__dirname, "../public/sitemap.xml"), xml);
console.log("sitemap.xml generated.");
