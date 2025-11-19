#!/usr/bin/env node

/**
 * Figma MCP Connection Test Script
 * Tests the Figma MCP server configuration and connection
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local and .env files
dotenv.config({ path: ".env.local" });
dotenv.config();

const execAsync = promisify(exec);

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

function log(message, color = "") {
  console.log(`${color}${message}${RESET}`);
}

async function checkFigmaAPI() {
  log("\n🔍 Testing Figma API connectivity...", BLUE);

  const figmaToken = process.env.FIGMA_TOKEN || process.env.FIGMA_API_KEY;

  if (!figmaToken) {
    log(`❌ No Figma token found in environment variables`, RED);
    log(`   Expected: FIGMA_TOKEN or FIGMA_API_KEY`, YELLOW);
    return false;
  }

  try {
    const response = await fetch("https://api.figma.com/v1/me", {
      headers: {
        "X-Figma-Token": figmaToken,
      },
    });

    if (response.ok) {
      const user = await response.json();
      log(`✅ Figma API is accessible`, GREEN);
      log(`👤 Authenticated as: ${user.email}`, YELLOW);
      log(`🆔 User ID: ${user.id}`, YELLOW);
      return true;
    } else {
      log(`❌ Figma API returned status: ${response.status}`, RED);
      const errorText = await response.text();
      log(`   Error: ${errorText}`, RED);
      return false;
    }
  } catch (error) {
    log(`❌ Failed to reach Figma API: ${error.message}`, RED);
    return false;
  }
}

async function checkMCPConfig() {
  log("\n📋 Checking MCP configuration...", BLUE);

  const mcpPath = path.join(process.cwd(), "mcp.json");

  try {
    if (!fs.existsSync(mcpPath)) {
      log(`❌ mcp.json not found at ${mcpPath}`, RED);
      return false;
    }

    const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, "utf8"));

    if (!mcpConfig.mcpServers?.["figma-developer-mcp"]) {
      log(`❌ Figma MCP server not configured in mcp.json`, RED);
      return false;
    }

    const figmaConfig = mcpConfig.mcpServers["figma-developer-mcp"];

    log(`✅ Figma MCP configuration found`, GREEN);
    log(`   Type: ${figmaConfig.type}`, YELLOW);
    log(`   URL: ${figmaConfig.url}`, YELLOW);

    if (
      figmaConfig.type === "sse" &&
      figmaConfig.url === "http://localhost:3333/sse"
    ) {
      log(`✅ Using figma-developer-mcp SSE server`, GREEN);
    } else {
      log(`⚠️  Using custom Figma MCP configuration`, YELLOW);
    }

    return true;
  } catch (error) {
    log(`❌ Failed to read mcp.json: ${error.message}`, RED);
    return false;
  }
}

async function checkEnvironmentVariables() {
  log("\n🔐 Checking environment variables...", BLUE);

  const figmaToken = process.env.FIGMA_TOKEN || process.env.FIGMA_API_KEY;

  if (!figmaToken) {
    log(`❌ No Figma token found in environment variables`, RED);
    log(`   Expected: FIGMA_TOKEN or FIGMA_API_KEY`, YELLOW);
    log(
      `   Please set one of these environment variables with your Figma Personal Access Token`,
      YELLOW,
    );
    return false;
  }

  log(`✅ Figma token found in environment`, GREEN);
  log(`   Token length: ${figmaToken.length} characters`, YELLOW);
  log(`   Token prefix: ${figmaToken.substring(0, 8)}...`, YELLOW);

  return true;
}

async function checkFigmaMCPPackage() {
  log("\n📦 Checking Figma MCP package installation...", BLUE);

  const packageJsonPath = path.join(process.cwd(), "package.json");

  try {
    if (!fs.existsSync(packageJsonPath)) {
      log(`❌ package.json not found`, RED);
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (dependencies["figma-developer-mcp"]) {
      log(`✅ figma-developer-mcp package installed`, GREEN);
      log(`   Version: ${dependencies["figma-developer-mcp"]}`, YELLOW);
      return true;
    } else {
      log(`❌ figma-developer-mcp package not found in dependencies`, RED);
      log(`   Run: npm install figma-developer-mcp`, YELLOW);
      return false;
    }
  } catch (error) {
    log(`❌ Failed to check package.json: ${error.message}`, RED);
    return false;
  }
}

async function testFigmaFileAccess() {
  log("\n📄 Testing Figma file access...", BLUE);

  const figmaToken = process.env.FIGMA_TOKEN || process.env.FIGMA_API_KEY;
  const figmaFileKey = process.env.FIGMA_FILE_KEY || "d8nFs8A5KcjbFr6KkwZV4H5K";

  if (!figmaToken) {
    log(`❌ No Figma token available for testing`, RED);
    return false;
  }

  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${figmaFileKey}`,
      {
        headers: {
          "X-Figma-Token": figmaToken,
        },
      },
    );

    if (response.ok) {
      const fileData = await response.json();
      log(`✅ Figma file access successful`, GREEN);
      log(`   File: ${fileData.name}`, YELLOW);
      log(`   Last Modified: ${fileData.lastModified}`, YELLOW);
      log(`   Version: ${fileData.version}`, YELLOW);
      return true;
    } else {
      log(
        `❌ Figma file access failed: ${response.status} ${response.statusText}`,
        RED,
      );
      if (response.status === 403) {
        log(
          `   This might indicate insufficient permissions or invalid file key`,
          YELLOW,
        );
      }
      if (response.status === 404) {
        log(
          `   File not found. Check your FIGMA_FILE_KEY environment variable`,
          YELLOW,
        );
      }
      return false;
    }
  } catch (error) {
    log(`❌ Failed to test Figma file access: ${error.message}`, RED);
    return false;
  }
}

async function main() {
  log("🎨 Figma MCP Connection Test", BLUE);
  log("=====================================", BLUE);

  const tests = [
    { name: "MCP Configuration", test: checkMCPConfig },
    { name: "Figma MCP Package", test: checkFigmaMCPPackage },
    { name: "Environment Variables", test: checkEnvironmentVariables },
    { name: "Figma API Connectivity", test: checkFigmaAPI },
    { name: "Figma File Access", test: testFigmaFileAccess },
  ];

  let passed = 0;
  let total = tests.length;

  for (const { name, test } of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      }
    } catch (error) {
      log(`❌ Test "${name}" failed with error: ${error.message}`, RED);
    }
  }

  log("\n📊 Test Summary", BLUE);
  log("================", BLUE);
  log(
    `Tests passed: ${passed}/${total}`,
    passed === total ? GREEN : passed > 0 ? YELLOW : RED,
  );

  if (passed === total) {
    log("🎉 All tests passed! Your Figma MCP should be ready to use.", GREEN);
  } else if (passed > 0) {
    log(
      "⚠️  Some tests failed. Check the errors above and refer to docs/FIGMA_MCP_SETUP.md",
      YELLOW,
    );
  } else {
    log(
      "❌ All tests failed. Please check your configuration and refer to docs/FIGMA_MCP_SETUP.md",
      RED,
    );
  }

  log("\n📚 Next Steps:", BLUE);
  log("- Review docs/FIGMA_MCP_SETUP.md for setup instructions", YELLOW);
  log("- Create a Figma Personal Access Token if you haven't already", YELLOW);
  log("- Set the FIGMA_TOKEN environment variable", YELLOW);
  log("- Start the Figma MCP server: npx figma-developer-mcp", YELLOW);
  log("- Restart your MCP host (VS Code, Claude Desktop, etc.)", YELLOW);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
