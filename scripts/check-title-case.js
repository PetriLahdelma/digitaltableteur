// scripts/check-title-case.js
// Checks that all <h1> and <h2> elements in /src/pages/posts/*.tsx are in title case

const fs = require("fs");
const path = require("path");

const POSTS_DIR = path.join(__dirname, "../src/pages/posts");
const TITLE_CASE_REGEX = /^[A-Z][a-zA-Z0-9'’\-:,.() ]*$/;

function isTitleCase(str) {
  // Accepts: Each word starts with uppercase, allows for punctuation, numbers, etc.
  return str.split(" ").every((word) => {
    // Ignore short words and prepositions
    if (
      [
        "a",
        "an",
        "the",
        "and",
        "but",
        "or",
        "for",
        "nor",
        "on",
        "at",
        "to",
        "by",
        "with",
        "of",
        "in",
        "as",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
      ].includes(word.toLowerCase())
    )
      return true;
    // Accept punctuation at end
    return (
      /^[A-Z][a-zA-Z0-9'’\-:,.()]*$/.test(word) || word === word.toUpperCase()
    );
  });
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const h1Matches = [...content.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)];
  const h2Matches = [...content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs)];
  let errors = [];
  h1Matches.forEach(([, text]) => {
    const clean = text.replace(/<[^>]+>/g, "").trim();
    if (clean && !isTitleCase(clean)) {
      errors.push({ tag: "h1", text: clean });
    }
  });
  h2Matches.forEach(([, text]) => {
    const clean = text.replace(/<[^>]+>/g, "").trim();
    if (clean && !isTitleCase(clean)) {
      errors.push({ tag: "h2", text: clean });
    }
  });
  return errors;
}

function main() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".tsx"));
  let hasError = false;
  files.forEach((file) => {
    const filePath = path.join(POSTS_DIR, file);
    const errors = checkFile(filePath);
    if (errors.length) {
      hasError = true;
      console.log(`\n${file}:`);
      errors.forEach(e => {
        console.log(`  [${e.tag}] Not title case: "${e.text}"`);
      });
    }
  });
  if (!hasError) {
    console.log("All H1 and H2 elements are in title case.");
  }
}

main();
