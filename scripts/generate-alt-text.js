require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OPENAI_API_KEY not set, skipping alt text generation.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function generateAltText(description) {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You generate concise image alt text for accessibility.",
      },
      {
        role: "user",
        content: `Describe the image ${description} in under 12 words.`,
      },
    ],
  });
  return completion.choices[0].message.content.trim().replace(/\n/g, " ");
}

const POSTS_DIR = path.join(__dirname, "../src/pages");
const FILE_PATTERN = /<img[^>]*src={(.*?)}[^>]*alt="(.*?)"[^>]*>/g;

async function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const matches = [...content.matchAll(FILE_PATTERN)];
  if (!matches.length) return;
  for (const match of matches) {
    const [full, srcExpr, alt] = match;
    if (alt && alt !== "Illustration" && alt !== "Icon") continue;
    const imgPath = srcExpr.replace(/[^\w.-]/g, "");
    const fileName = path.basename(imgPath);
    console.log(
      `Generating alt text for ${fileName} in ${path.basename(filePath)}`,
    );
    const altText = await generateAltText(`named ${fileName}`);
    content = content.replace(
      full,
      full.replace(`alt=\"${alt}\"`, `alt=\"${altText}\"`),
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
