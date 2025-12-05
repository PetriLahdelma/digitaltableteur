#!/usr/bin/env node
/**
 * Test Sentry MCP Server Configuration
 *
 * Validates:
 * - Official Sentry MCP server accessibility (https://mcp.sentry.dev/mcp)
 * - MCP configuration in mcp.json
 * - OAuth setup readiness or STDIO mode configuration
 * - Environment variables for STDIO mode (optional)
 *
 * Usage:
 *   node scripts/test-sentry-mcp.mjs
 *
 * Environment Variables (optional, for STDIO mode only):
 *   SENTRY_ACCESS_TOKEN - User auth token with org:read, project:read, project:write, team:read, team:write, event:write
 *   SENTRY_HOST - Optional, for self-hosted Sentry (defaults to sentry.io)
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import fetch from "node-fetch";
import { config as loadEnv } from "dotenv";

// Load local env file for developer convenience
loadEnv({ path: ".env.local" });

const SENTRY_MCP_URL = "https://mcp.sentry.dev/mcp";
const SENTRY_API_BASE = "https://sentry.io/api/0";

console.log("🔍 Testing Sentry MCP Server Configuration\n");

// ============================
// 1. Test Sentry MCP Server Accessibility
// ============================
async function checkSentryMCPServer() {
  console.log("📡 Checking Sentry MCP server accessibility...");
  try {
    const response = await fetch(SENTRY_MCP_URL, {
      method: "GET",
      headers: {
        "User-Agent": "digitaltableteur-test-script",
      },
    });

    // Expected: 405 (Method Not Allowed) or 401 (Unauthorized) for OAuth-based server
    // This confirms the server exists and is responding
    if (
      response.status === 405 ||
      response.status === 401 ||
      response.status === 200
    ) {
      console.log(
        `✅ Sentry MCP server accessible at ${SENTRY_MCP_URL} (status: ${response.status})`,
      );
      console.log(
        "   Note: OAuth authentication will be handled by MCP client (Claude Code, Cursor, etc.)\n",
      );
      return true;
    } else {
      console.log(
        `⚠️  Unexpected status ${response.status} from Sentry MCP server`,
      );
      console.log(
        `   This may be normal - OAuth servers often return 401/405 without credentials\n`,
      );
      return true; // Not a failure, just informational
    }
  } catch (error) {
    console.error(`❌ Failed to reach Sentry MCP server: ${error.message}`);
    console.error("   Check your internet connection or try again later\n");
    return false;
  }
}

// ============================
// 2. Check MCP Configuration
// ============================
function checkMCPConfig() {
  console.log("📋 Checking MCP configuration in mcp.json...");
  try {
    const mcpConfigPath = resolve("mcp.json");
    const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));

    const sentryConfig = mcpConfig.mcpServers?.sentry;

    if (!sentryConfig) {
      console.error("❌ No 'sentry' entry found in mcp.json");
      console.error("   Add the following to mcpServers:\n");
      console.error('   "sentry": {');
      console.error('     "type": "http",');
      console.error('     "url": "https://mcp.sentry.dev/mcp"');
      console.error("   }\n");
      return false;
    }

    if (sentryConfig.type !== "http") {
      console.error(
        `❌ Sentry MCP server type should be "http", found: ${sentryConfig.type}`,
      );
      return false;
    }

    if (sentryConfig.url !== SENTRY_MCP_URL) {
      console.error(`❌ Sentry MCP server URL incorrect`);
      console.error(`   Expected: ${SENTRY_MCP_URL}`);
      console.error(`   Found: ${sentryConfig.url}\n`);
      return false;
    }

    console.log("✅ MCP configuration found and correct");
    console.log(`   Type: ${sentryConfig.type}`);
    console.log(`   URL: ${sentryConfig.url}`);
    if (sentryConfig.description) {
      console.log(`   Description: ${sentryConfig.description}`);
    }
    console.log();

    return true;
  } catch (error) {
    console.error(`❌ Failed to read mcp.json: ${error.message}\n`);
    return false;
  }
}

// ============================
// 3. Check Environment Variables (STDIO mode only)
// ============================
function checkEnvironmentVariables() {
  console.log(
    "🔐 Checking environment variables (for STDIO mode - optional)...",
  );

  const accessToken = process.env.SENTRY_ACCESS_TOKEN;
  const host = process.env.SENTRY_HOST || "sentry.io";

  if (!accessToken) {
    console.log(
      "ℹ️  No SENTRY_ACCESS_TOKEN found (this is fine for OAuth mode)",
    );
    console.log("   OAuth authentication will be handled by your MCP client");
    console.log(
      "   If you want to use STDIO mode instead, set SENTRY_ACCESS_TOKEN\n",
    );
    return { hasToken: false, host };
  }

  console.log("✅ SENTRY_ACCESS_TOKEN found for STDIO mode");
  console.log(`   Token length: ${accessToken.length} chars`);
  console.log(`   Token prefix: ${accessToken.substring(0, 12)}...`);
  console.log(`   Host: ${host}`);
  console.log();

  return { hasToken: true, accessToken, host };
}

// ============================
// 4. Test Sentry API Connectivity (if token available)
// ============================
async function testSentryAPI({ hasToken, accessToken, host }) {
  if (!hasToken) {
    console.log(
      "ℹ️  Skipping Sentry API test (no access token - using OAuth mode)\n",
    );
    return true;
  }

  console.log("🧪 Testing Sentry API connectivity (STDIO mode)...");

  try {
    const apiBase = `https://${host}/api/0`;
    const response = await fetch(`${apiBase}/organizations/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(
        `❌ Sentry API request failed: ${response.status} ${response.statusText}`,
      );
      if (response.status === 401) {
        console.error("   Token may be invalid or expired");
        console.error(
          "   Generate a new token at: https://sentry.io/settings/account/api/auth-tokens/",
        );
      }
      console.error();
      return false;
    }

    const data = await response.json();
    console.log(`✅ Sentry API accessible`);
    console.log(`   Found ${data.length} organization(s):`);
    data.slice(0, 3).forEach((org) => {
      console.log(`   - ${org.name} (${org.slug})`);
    });
    if (data.length > 3) {
      console.log(`   ... and ${data.length - 3} more`);
    }
    console.log();

    return true;
  } catch (error) {
    console.error(`❌ Failed to test Sentry API: ${error.message}\n`);
    return false;
  }
}

// ============================
// 5. Display Available Tools
// ============================
function displayAvailableTools() {
  console.log("📚 Available Sentry MCP Tools (16+ tools):\n");

  const toolCategories = [
    {
      name: "🏢 Organization & Project Management",
      tools: [
        "list_organizations - Query all accessible Sentry organizations",
        "list_projects - Find and list projects across organizations",
        "create_project - Create new Sentry projects",
        "list_teams - Manage and query team information",
      ],
    },
    {
      name: "🐛 Issue & Error Management",
      tools: [
        "get_issue_details - Access detailed issue information with full context",
        "search_issues - Find issues across projects with filters",
        "search_errors_in_file - Find errors in specific source files",
        "list_dsns - List Data Source Names for projects",
        "create_dsn - Create new DSNs for instrumentation",
      ],
    },
    {
      name: "🤖 Seer AI Integration (Automated Debugging)",
      tools: [
        "invoke_seer - Trigger Sentry's AI agent for root cause analysis",
        "get_seer_fix_status - Monitor automated fix progress",
        "get_seer_fix_details - Retrieve AI-generated solutions and recommendations",
      ],
    },
    {
      name: "📊 Release & Performance",
      tools: [
        "query_releases - Analyze release information and deployments",
        "query_performance - Access transaction and performance data",
        "custom_queries - Execute complex searches across Sentry data",
      ],
    },
  ];

  toolCategories.forEach((category) => {
    console.log(category.name);
    category.tools.forEach((tool) => {
      console.log(`  • ${tool}`);
    });
    console.log();
  });
}

// ============================
// 6. Provide Next Steps
// ============================
function provideNextSteps(allChecksPassed) {
  console.log("=".repeat(60));

  if (allChecksPassed) {
    console.log("\n✅ ALL CHECKS PASSED\n");
    console.log("🎉 Your Sentry MCP configuration is ready!\n");
    console.log("Next steps:\n");
    console.log(
      "1. Open Claude Code, Cursor, or another MCP-compatible client",
    );
    console.log("2. You'll be prompted to authenticate with Sentry via OAuth");
    console.log("3. Grant access to your Sentry organization");
    console.log("4. Try prompts like:");
    console.log("   - 'Show me recent issues in Sentry'");
    console.log(
      "   - 'Search Sentry for errors in components/UserProfile.tsx'",
    );
    console.log("   - 'Use Seer to analyze Sentry issue PROJ-123'");
    console.log("   - 'Create a new Sentry project for my-service'\n");
    console.log("📖 Documentation: https://docs.sentry.io/product/sentry-mcp/");
    console.log("🌐 Web Client: https://mcp.sentry.dev/\n");
  } else {
    console.log("\n⚠️  SOME CHECKS FAILED\n");
    console.log("Please review the errors above and:\n");
    console.log("1. Ensure mcp.json has correct Sentry configuration");
    console.log("2. Check internet connectivity to https://mcp.sentry.dev/mcp");
    console.log("3. For STDIO mode, verify SENTRY_ACCESS_TOKEN is valid");
    console.log("4. Refer to: https://docs.sentry.io/product/sentry-mcp/\n");
  }

  console.log("=".repeat(60));
}

// ============================
// Main Execution
// ============================
async function main() {
  const checks = [];

  // Run all checks
  checks.push(await checkSentryMCPServer());
  checks.push(checkMCPConfig());
  const envVars = checkEnvironmentVariables();
  checks.push(await testSentryAPI(envVars));

  displayAvailableTools();

  const allChecksPassed = checks.every((check) => check !== false);
  provideNextSteps(allChecksPassed);

  process.exit(allChecksPassed ? 0 : 1);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
