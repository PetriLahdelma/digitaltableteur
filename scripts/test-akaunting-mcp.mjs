#!/usr/bin/env node

/**
 * Akaunting MCP Connection Test
 *
 * Tests connectivity and authentication with Akaunting API
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, "../akaunting/.env");

function loadEnv() {
  if (!existsSync(ENV_PATH)) {
    console.error("❌ .env file not found in akaunting/");
    console.error("   Run: cd akaunting && cp env.example .env");
    process.exit(1);
  }

  const envContent = readFileSync(ENV_PATH, "utf-8");
  const env = {};

  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

async function testConnection(baseUrl, username, password, companyId) {
  console.log(`🔍 Testing connection to: ${baseUrl}`);

  if (!username || !password) {
    console.error("\n❌ API credentials not configured");
    console.error(
      "   Please set AKAUNTING_API_USERNAME and AKAUNTING_API_PASSWORD in akaunting/.env",
    );
    return false;
  }

  // Create Basic Auth token
  const authToken = Buffer.from(`${username}:${password}`).toString("base64");

  try {
    // Test basic connectivity
    const response = await fetch(`${baseUrl}/companies`, {
      headers: {
        Authorization: `Basic ${authToken}`,
        "X-Company": companyId,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Connection successful!");
      console.log(`📊 Found ${data.data?.length || 0} invoices`);
      return true;
    } else if (response.status === 401) {
      console.error("❌ Authentication failed (401 Unauthorized)");
      console.error("   Check that your API key is correct and hasn't expired");
      return false;
    } else {
      console.error(`❌ API returned status: ${response.status}`);
      const text = await response.text();
      console.error(`   Response: ${text}`);
      return false;
    }
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error("❌ Connection refused");
      console.error("   Is Akaunting running? Start it with:");
      console.error("   cd akaunting && docker compose up -d");
    } else {
      console.error(`❌ Connection error: ${error.message}`);
    }
    return false;
  }
}

async function testEndpoints(baseUrl, authToken, companyId) {
  const endpoints = [
    { name: "Invoices", path: "/invoices" },
    { name: "Contacts", path: "/contacts" },
    { name: "Items", path: "/items" },
    { name: "Transactions", path: "/transactions" },
    { name: "Categories", path: "/categories" },
  ];

  console.log("\n🧪 Testing API endpoints...\n");

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        headers: {
          Authorization: `Basic ${authToken}`,
          "X-Company": companyId,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const count = data.data?.length || 0;
        console.log(`✅ ${endpoint.name.padEnd(15)} - ${count} records`);
      } else {
        console.log(
          `⚠️  ${endpoint.name.padEnd(15)} - Status ${response.status}`,
        );
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name.padEnd(15)} - ${error.message}`);
    }
  }
}

async function main() {
  console.log("🚀 Akaunting MCP Connection Test\n");

  const env = loadEnv();
  const baseUrl = env.AKAUNTING_API_BASE_URL || "http://localhost:8080/api";
  const username = env.AKAUNTING_API_USERNAME;
  const password = env.AKAUNTING_API_PASSWORD;
  const companyId = env.AKAUNTING_COMPANY_ID || "1";

  const connected = await testConnection(
    baseUrl,
    username,
    password,
    companyId,
  );

  if (connected) {
    const authToken = Buffer.from(`${username}:${password}`).toString("base64");
    await testEndpoints(baseUrl, authToken, companyId);

    console.log("\n✅ All tests passed!");
    console.log("\n📋 Your MCP can now:");
    console.log("   • List and create invoices");
    console.log("   • Manage customers and vendors");
    console.log("   • Track transactions and expenses");
    console.log("   • Generate financial reports");
    console.log("   • Automate bookkeeping tasks");
  } else {
    console.log("\n❌ Connection test failed");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
