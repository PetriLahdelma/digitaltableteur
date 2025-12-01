#!/usr/bin/env node

/**
 * Akaunting MCP Configuration Script
 *
 * This script adds Akaunting API configuration to mcp.json
 * for VS Code MCP integration.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const MCP_CONFIG_PATH = resolve(ROOT_DIR, "mcp.json");
const ENV_PATH = resolve(ROOT_DIR, "akaunting", ".env");

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

function updateMcpConfig(env) {
  if (!existsSync(MCP_CONFIG_PATH)) {
    console.error("❌ mcp.json not found in project root");
    process.exit(1);
  }

  const mcpConfig = JSON.parse(readFileSync(MCP_CONFIG_PATH, "utf-8"));

  // Add Akaunting MCP configuration
  mcpConfig.mcpServers = mcpConfig.mcpServers || {};
  mcpConfig.mcpServers.akaunting = {
    type: "http",
    baseUrl: env.AKAUNTING_API_BASE_URL || "http://localhost:8080/api/v1",
    auth: {
      type: "bearer",
      token: env.AKAUNTING_API_KEY || "REPLACE_WITH_YOUR_API_KEY",
    },
    description: "Akaunting Accounting Software API",
    endpoints: {
      invoices: "/invoices",
      contacts: "/contacts",
      items: "/items",
      transactions: "/transactions",
      reports: "/reports",
      categories: "/categories",
      expenses: "/expenses",
    },
  };

  writeFileSync(MCP_CONFIG_PATH, JSON.stringify(mcpConfig, null, 2), "utf-8");

  console.log("✅ Updated mcp.json with Akaunting configuration");

  if (!env.AKAUNTING_API_KEY || env.AKAUNTING_API_KEY === "") {
    console.warn(
      "\n⚠️  WARNING: AKAUNTING_API_KEY is not set in akaunting/.env",
    );
    console.warn(
      "   Please add your API key after generating it in Akaunting.",
    );
    console.warn(
      "   Then run this script again: npm run akaunting:mcp:setup\n",
    );
  } else {
    console.log("\n🎉 MCP integration configured successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Restart VS Code to load new MCP configuration");
    console.log("   2. Your MCP can now interact with Akaunting API");
    console.log("   3. Test with: npm run akaunting:mcp:test\n");
  }
}

try {
  console.log("🔧 Setting up Akaunting MCP integration...\n");
  const env = loadEnv();
  updateMcpConfig(env);
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
