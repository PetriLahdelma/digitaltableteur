#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@sanity/client");

const ROOT_DIR = process.cwd();
const envLocal = path.join(ROOT_DIR, ".env.local");
require("dotenv").config();
if (fs.existsSync(envLocal)) {
  require("dotenv").config({ path: envLocal, override: false });
}

function assertEnv() {
  if (!process.env.SANITY_PROJECT_ID) {
    throw new Error("SANITY_PROJECT_ID is not defined");
  }
  if (!process.env.SANITY_DATASET) {
    throw new Error("SANITY_DATASET is not defined");
  }
  if (!process.env.SANITY_TOKEN) {
    throw new Error("SANITY_TOKEN is not defined");
  }
}

async function main() {
  try {
    assertEnv();
    const client = createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      token: process.env.SANITY_TOKEN,
      apiVersion: "2023-10-01",
      useCdn: false,
    });
    const docs = await client.fetch('*[_id match "blog.*"]{_id}');
    if (!docs.length) {
      console.log("No legacy blog.* documents found.");
      return;
    }
    const tx = docs.reduce(
      (transaction, doc) => transaction.delete(doc._id),
      client.transaction(),
    );
    await tx.commit();
    console.log(`Deleted ${docs.length} legacy documents (blog.*).`);
  } catch (error) {
    console.error("[sanity-migration] Failed to delete legacy documents.");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
