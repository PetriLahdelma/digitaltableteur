#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { subscribeToIssue, LinearError } from "../../lib/linear/createIssue";

dotenv.config();
const envLocal = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: false });
}

const apiKey = process.env.LINEAR_API_KEY;
if (!apiKey) {
  console.error("LINEAR_API_KEY is missing. Update .env.local before running.");
  process.exit(1);
}

function parseArgs(): { issueId?: string; userEmail?: string } {
  const args: { issueId?: string; userEmail?: string } = {};
  const input = process.argv.slice(2);

  for (let i = 0; i < input.length; i++) {
    const key = input[i];
    const nextValue = input[i + 1];

    if ((key === "--issue" || key === "-i") && nextValue) {
      args.issueId = nextValue;
      i++;
    } else if ((key === "--email" || key === "-e") && nextValue) {
      args.userEmail = nextValue;
      i++;
    }
  }

  return args;
}

async function main() {
  const { issueId, userEmail } = parseArgs();

  if (!issueId || !userEmail) {
    console.error(
      "Usage: npx tsx scripts/linear/subscribe-issue.ts --issue <issueId> --email <userEmail>",
    );
    console.error(
      "Example: npx tsx scripts/linear/subscribe-issue.ts --issue abc123 --email petri@digitaltableteur.com",
    );
    process.exit(1);
  }

  try {
    console.log(`📧 Subscribing ${userEmail} to issue ${issueId}...`);

    const success = await subscribeToIssue(issueId, userEmail);

    if (success) {
      console.log("✅ Successfully subscribed to issue!");
    } else {
      console.log("⚠️  Subscription request processed but success was false.");
    }
  } catch (error) {
    if (error instanceof LinearError) {
      console.error(`❌ Linear Error: ${error.message}`);
    } else {
      console.error("❌ Error:", (error as Error).message);
    }
    process.exit(1);
  }
}

main();
