#!/usr/bin/env node

/**
 * Akaunting MCP Configuration Script
 *
 * This script adds Akaunting API configuration to mcp.json
 * for VS Code MCP integration.
 */

import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const MCP_CONFIG_PATH = resolve(ROOT_DIR, "mcp.json");
const ENV_PATH = resolve(ROOT_DIR, "akaunting", ".env");

function isPrivateHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  );
}

function resolveSafeAkauntingBaseUrl(value) {
  const candidate = value || "http://localhost:8080/api/v1";
  let parsed;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("AKAUNTING_API_BASE_URL is not a valid URL");
  }

  if (parsed.username || parsed.password) {
    throw new Error("AKAUNTING_API_BASE_URL must not include credentials");
  }

  if (parsed.protocol === "https:") {
    return parsed.toString().replace(/\/$/, "");
  }

  if (parsed.protocol === "http:" && isPrivateHost(parsed.hostname)) {
    return parsed.toString().replace(/\/$/, "");
  }

  throw new Error(
    "AKAUNTING_API_BASE_URL must use https or point to a localhost/private-network host over http",
  );
}

function atomicWriteJson(filePath, payload) {
  const tempPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;

  try {
    writeFileSync(tempPath, `${JSON.stringify(payload, null, 2)}\n`, {
      encoding: "utf-8",
      mode: 0o600,
      flag: "wx",
    });
    renameSync(tempPath, filePath);
  } catch (error) {
    if (existsSync(tempPath)) {
      unlinkSync(tempPath);
    }
    throw error;
  }
}

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
    baseUrl: resolveSafeAkauntingBaseUrl(env.AKAUNTING_API_BASE_URL),
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

  atomicWriteJson(MCP_CONFIG_PATH, mcpConfig);

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
