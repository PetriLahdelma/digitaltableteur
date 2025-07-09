const fs = require("fs");
const https = require("https");
const { JSDOM } = require("jsdom");
const { parseStringPromise } = require("xml2js");

const SITEMAP_PATH = "./public/sitemap.xml";
const OUTPUT_PATH = "./public/llms.txt";

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function extractPageData(url) {
  try {
    const html = await fetchPage(url);
    const dom = new JSDOM(html);
    const { document } = dom.window;
    const title = document.querySelector("title")?.textContent || "";
    const metaDesc =
      document.querySelector("meta[name='description']")?.content || "";
    const lang = document.documentElement.lang || "en";
    const canonical =
      document.querySelector("link[rel='canonical']")?.href || url;
    const headings = Array.from(document.querySelectorAll("h1, h2, h3")).map(
      (h) => h.textContent.trim(),
    );
    const mainContent = document.body.textContent.trim().slice(0, 500) || "";
    return {
      url,
      title,
      metaDesc,
      lang,
      canonical,
      headings,
      mainContent,
      success: true,
    };
  } catch (e) {
    return { url, success: false };
  }
}

(async () => {
  const sitemapXml = fs.readFileSync(SITEMAP_PATH, "utf-8");
  const sitemap = await parseStringPromise(sitemapXml);
  const urls = sitemap.urlset.url.map((u) => u.loc[0]);
  const results = [];
  let successCount = 0;
  for (const url of urls) {
    const data = await extractPageData(url);
    if (data.success) successCount++;
    results.push(data);
  }
  const now = new Date().toISOString();
  // --- llms.txt (concise) ---
  let txt =
    "# Digitaltableteur\n\n" +
    "> Digitaltableteur is a multilingual, accessible portfolio site, featuring internationalized content, responsive design, and best practices for LLMs and users.\n\n" +
    "This site showcases selected works, blog posts, and legal information in English, Finnish, and Swedish.\n\n" +
    "## Key Pages\n";
  // Only include main/important pages (home, about, works, blog, cookie policy, etc)
  const keyPages = results.filter(
    (page) =>
      page.success &&
      (page.url.endsWith("/") ||
        /about|cookie|privacy|blog|work|portfolio|projects/i.test(page.url)),
  );
  for (const page of keyPages) {
    txt += `- [${page.title || page.url}](${page.url})`;
    if (page.metaDesc) txt += `: ${page.metaDesc}`;
    txt += "\n";
  }
  txt += "\n## Optional\n";
  // List other pages as optional
  const optionalPages = results.filter(
    (page) => page.success && !keyPages.includes(page),
  );
  for (const page of optionalPages) {
    txt += `- [${page.title || page.url}](${page.url})`;
    if (page.metaDesc) txt += `: ${page.metaDesc}`;
    txt += "\n";
  }
  fs.writeFileSync("./public/llms.txt", txt);

  // --- llms-full.txt (all pages, more detail) ---
  let fullTxt =
    "# Digitaltableteur\n\n" +
    "> Digitaltableteur is a multilingual, accessible portfolio site for Petri Lahdelma, featuring internationalized content, responsive design, and best practices for LLMs and users.\n\n" +
    "This site showcases all public pages, works, and blog posts in English, Finnish, and Swedish.\n\n" +
    "## All Pages\n";
  for (const page of results) {
    fullTxt += `- [${page.title || page.url}](${page.url})`;
    if (page.metaDesc) fullTxt += `: ${page.metaDesc}`;
    fullTxt += "\n";
  }
  fullTxt += "\n---\n";
  for (const page of results) {
    if (!page.success) continue;
    fullTxt += `\n### Page: ${page.url}\n`;
    fullTxt += `Title: ${page.title}\nMeta Description: ${page.metaDesc}\nLanguage: ${page.lang}\nCanonical URL: ${page.canonical}\n\n## Headings Structure:\n`;
    if (page.headings.length) {
      fullTxt += page.headings.map((h) => `- ${h}`).join("\n") + "\n";
    } else {
      fullTxt += "No headings found\n";
    }
    fullTxt += `\n## Main Content:\n${page.mainContent}\n\n---\n`;
  }
  fs.writeFileSync("./public/llms-full.txt", fullTxt);

  console.log("llms.txt (concise) and llms-full.txt (detailed) generated.");
})();
