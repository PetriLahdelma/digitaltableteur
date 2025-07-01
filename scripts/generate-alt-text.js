require("dotenv").config();
const fs = require("fs");
const path = require("path");

const OPENAI_PROXY_URL = process.env.OPENAI_PROXY_URL ||
  "https://digitaltableteursecureproxy.vercel.app/api/openai-chat";

async function generateAltText(description) {
  const prompt = `Describe the image ${description} in under 12 words.`;
  const response = await fetch(OPENAI_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    throw new Error(`Proxy error: ${await response.text()}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim().replace(/\n/g, " ") || "";
}

const POSTS_DIR = path.join(__dirname, "../src/pages");
const FILE_PATTERN = /<img[^>]*src={(.*?)}[^>]*alt="(.*?)"[^>]*>/g;

async function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const matches = [...content.matchAll(FILE_PATTERN)];
  if (!matches.length) return;
  for (const match of matches) {
    const [full, srcExpr, alt] = match;
    const imgPath = srcExpr.replace(/[^\w.-]/g, "");
    const fileName = path.basename(imgPath);
    console.log(
      `Generating alt text for ${fileName} in ${path.basename(filePath)}`
    );
    const altText = await generateAltText(`named ${fileName}`);
    content = content.replace(
      full,
      full.replace(`alt="${alt}"`, `alt="${altText}"`)
    );
  }
  fs.writeFileSync(filePath, content);
}

(async () => {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".tsx"));
  for (const file of files) {
    await processFile(path.join(POSTS_DIR, file));
  }
})();
