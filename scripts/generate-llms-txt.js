const fs = require("fs");
const https = require("https");
const { JSDOM } = require("jsdom");
const { parseStringPromise } = require("xml2js");

const SITEMAP_PATH = "./public/sitemap.xml";
const OUTPUT_PATH = "./public/LLMs.txt";

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
  let txt = `# LLM.txt - Website Content Structure\n# Generated: ${now}\n# Source: https://digitaltableteur.com/sitemap.xml\n# Total Pages: ${urls.length}\n# Success Rate: ${((successCount / urls.length) * 100).toFixed(1)}%\n\n## Site Metadata\nSite URL: https://digitaltableteur.com\nExtraction Date: ${now.slice(0, 10)}\nTotal Pages Processed: ${urls.length}\nSuccessful Pages: ${successCount}\nFailed Pages: ${urls.length - successCount}\nSuccess Rate: ${((successCount / urls.length) * 100).toFixed(1)}%\n\n---\n`;
  for (const page of results) {
    txt += `\n### Page: ${page.url}\n`;
    if (!page.success) {
      txt += "Extraction failed.\n---\n";
      continue;
    }
    txt += `Title: ${page.title}\nMeta Description: ${page.metaDesc}\nLanguage: ${page.lang}\nCanonical URL: ${page.canonical}\n\n## Headings Structure:\n`;
    if (page.headings.length) {
      txt += page.headings.map((h) => `- ${h}`).join("\n") + "\n";
    } else {
      txt += "No headings found\n";
    }
    txt += `\n## Main Content:\n${page.mainContent}\n\n---\n`;
  }
  fs.writeFileSync(OUTPUT_PATH, txt);
  console.log("LLMs.txt generated.");
})();
