#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { semanticSearch, LinearError } from "../../lib/linear/createIssue";

dotenv.config();
const envLocal = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: false });
}

const query = process.argv.slice(2).join(" ");
if (!query) {
  console.error(
    "Usage: npx tsx scripts/linear/semantic-search.ts <search query>",
  );
  console.error(
    'Example: npx tsx scripts/linear/semantic-search.ts "button accessibility bugs"',
  );
  process.exit(1);
}

const apiKey = process.env.LINEAR_API_KEY;
if (!apiKey) {
  console.error("LINEAR_API_KEY is missing. Update .env.local before running.");
  process.exit(1);
}

async function main() {
  try {
    console.log(`🔍 Searching for: "${query}"\n`);

    const results = await semanticSearch(query);

    if (results.length === 0) {
      console.log("No results found.");
      return;
    }

    console.log(`Found ${results.length} result(s):\n`);

    results.forEach((result, index) => {
      console.log(`${index + 1}. [${result.type}] ${result.title}`);
      if (result.identifier) {
        console.log(`   ID: ${result.identifier}`);
      }
      console.log(`   Linear ID: ${result.id}`);
      console.log();
    });
  } catch (error) {
    if (error instanceof LinearError) {
      console.error(`Linear Error: ${error.message}`);
    } else {
      console.error("Error:", (error as Error).message);
    }
    process.exit(1);
  }
}

main();
