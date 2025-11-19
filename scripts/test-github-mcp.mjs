#!/usr/bin/env node

/**
 * GitHub MCP Connection Test Script
 * Tests the GitHub MCP server configuration and connection
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

async function checkGitHubAPI() {
  log("\n🔍 Testing GitHub API connectivity...", BLUE);

  try {
    const response = await fetch("https://api.github.com/zen");
    if (response.ok) {
      const zen = await response.text();
      log(`✅ GitHub API is accessible`, GREEN);
      log(`📝 GitHub Zen: "${zen}"`, YELLOW);
      return true;
    } else {
      log(`❌ GitHub API returned status: ${response.status}`, RED);
      return false;
    }
  } catch (error) {
    log(`❌ Failed to reach GitHub API: ${error.message}`, RED);
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

    if (!mcpConfig.mcpServers?.github) {
      log(`❌ GitHub MCP server not configured in mcp.json`, RED);
      return false;
    }

    const githubConfig = mcpConfig.mcpServers.github;

    log(`✅ GitHub MCP configuration found`, GREEN);
    log(`   Type: ${githubConfig.type}`, YELLOW);
    log(`   URL: ${githubConfig.url}`, YELLOW);

    if (
      githubConfig.type === "http" &&
      githubConfig.url === "https://api.githubcopilot.com/mcp/"
    ) {
      log(`✅ Using official GitHub MCP remote server`, GREEN);
    } else {
      log(`⚠️  Using custom GitHub MCP configuration`, YELLOW);
    }

    return true;
  } catch (error) {
    log(`❌ Failed to read mcp.json: ${error.message}`, RED);
    return false;
  }
}

async function checkEnvironmentVariables() {
  log("\n🔐 Checking environment variables...", BLUE);

  const githubToken =
    process.env.GITHUB_MCP_PAT ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

  if (!githubToken) {
    log(`❌ No GitHub token found in environment variables`, RED);
    log(
      `   Expected: GITHUB_MCP_PAT, GITHUB_TOKEN, or GITHUB_PERSONAL_ACCESS_TOKEN`,
      YELLOW,
    );
    log(
      `   Please set one of these environment variables with your GitHub Personal Access Token`,
      YELLOW,
    );
    return false;
  }

  log(`✅ GitHub token found in environment`, GREEN);
  log(`   Token length: ${githubToken.length} characters`, YELLOW);
  log(`   Token prefix: ${githubToken.substring(0, 8)}...`, YELLOW);

  return true;
}

async function testGitHubTokenAccess() {
  log("\n🔑 Testing GitHub token access...", BLUE);

  const githubToken =
    process.env.GITHUB_MCP_PAT ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

  if (!githubToken) {
    log(`❌ No GitHub token available for testing`, RED);
    return false;
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "digitaltableteur-mcp-test",
      },
    });

    if (response.ok) {
      const user = await response.json();
      log(`✅ Token authentication successful`, GREEN);
      log(`   Authenticated as: ${user.login}`, YELLOW);
      log(`   User ID: ${user.id}`, YELLOW);
      log(`   Account Type: ${user.type}`, YELLOW);
      return true;
    } else {
      log(
        `❌ Token authentication failed: ${response.status} ${response.statusText}`,
        RED,
      );
      const errorText = await response.text();
      log(`   Error: ${errorText}`, RED);
      return false;
    }
  } catch (error) {
    log(`❌ Failed to test token: ${error.message}`, RED);
    return false;
  }
}

async function testRepositoryAccess() {
  log("\n📂 Testing repository access...", BLUE);

  const githubToken =
    process.env.GITHUB_MCP_PAT ||
    process.env.GITHUB_TOKEN ||
    process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

  if (!githubToken) {
    log(`❌ No GitHub token available for testing`, RED);
    return false;
  }

  // Test access to this repository
  const repo = "PetriLahdelma/digitaltableteur";

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "digitaltableteur-mcp-test",
      },
    });

    if (response.ok) {
      const repoData = await response.json();
      log(`✅ Repository access successful`, GREEN);
      log(`   Repository: ${repoData.full_name}`, YELLOW);
      log(`   Private: ${repoData.private}`, YELLOW);
      log(
        `   Permissions: ${JSON.stringify(repoData.permissions || "Not available")}`,
        YELLOW,
      );
      return true;
    } else {
      log(
        `❌ Repository access failed: ${response.status} ${response.statusText}`,
        RED,
      );
      if (response.status === 404) {
        log(
          `   This might be expected if the repository is private and your token doesn't have access`,
          YELLOW,
        );
      }
      return false;
    }
  } catch (error) {
    log(`❌ Failed to test repository access: ${error.message}`, RED);
    return false;
  }
}

async function main() {
  log("🚀 GitHub MCP Connection Test", BLUE);
  log("=====================================", BLUE);

  const tests = [
    { name: "GitHub API Connectivity", test: checkGitHubAPI },
    { name: "MCP Configuration", test: checkMCPConfig },
    { name: "Environment Variables", test: checkEnvironmentVariables },
    { name: "GitHub Token Access", test: testGitHubTokenAccess },
    { name: "Repository Access", test: testRepositoryAccess },
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
    log("🎉 All tests passed! Your GitHub MCP should be ready to use.", GREEN);
  } else if (passed > 0) {
    log(
      "⚠️  Some tests failed. Check the errors above and refer to docs/GITHUB_MCP_SETUP.md",
      YELLOW,
    );
  } else {
    log(
      "❌ All tests failed. Please check your configuration and refer to docs/GITHUB_MCP_SETUP.md",
      RED,
    );
  }

  log("\n📚 Next Steps:", BLUE);
  log("- Review docs/GITHUB_MCP_SETUP.md for setup instructions", YELLOW);
  log("- Create a GitHub Personal Access Token if you haven't already", YELLOW);
  log("- Set the GITHUB_MCP_PAT environment variable", YELLOW);
  log("- Restart your MCP host (VS Code, Claude Desktop, etc.)", YELLOW);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
