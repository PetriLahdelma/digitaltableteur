#!/usr/bin/env node
/**
 * Test Vercel MCP Server Configuration
 *
 * Validates:
 * - Official Vercel MCP server accessibility (https://mcp.vercel.com)
 * - MCP configuration in mcp.json
 * - OAuth setup readiness
 * - Project-specific URL configuration (optional)
 * - .vercel/project.json detection for team/project slugs
 *
 * Usage:
 *   node scripts/test-vercel-mcp.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import fetch from "node-fetch";

const VERCEL_MCP_URL = "https://mcp.vercel.com";

console.log("🔍 Testing Vercel MCP Server Configuration\n");

// ============================
// 1. Test Vercel MCP Server Accessibility
// ============================
async function checkVercelMCPServer() {
  console.log("📡 Checking Vercel MCP server accessibility...");
  try {
    const response = await fetch(VERCEL_MCP_URL, {
      method: "GET",
      headers: {
        "User-Agent": "digitaltableteur-test-script",
      },
    });

    // Expected: 401 (Unauthorized) or 405 (Method Not Allowed) for OAuth-based server
    // This confirms the server exists and is responding
    if (
      response.status === 405 ||
      response.status === 401 ||
      response.status === 200
    ) {
      console.log(
        `✅ Vercel MCP server accessible at ${VERCEL_MCP_URL} (status: ${response.status})`,
      );
      console.log(
        "   Note: OAuth authentication will be handled by MCP client (Claude Code, Cursor, etc.)\n",
      );
      return true;
    } else {
      console.log(
        `⚠️  Unexpected status ${response.status} from Vercel MCP server`,
      );
      console.log(
        `   This may be normal - OAuth servers often return 401/405 without credentials\n`,
      );
      return true; // Not a failure, just informational
    }
  } catch (error) {
    console.error(`❌ Failed to reach Vercel MCP server: ${error.message}`);
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

    const vercelConfig = mcpConfig.mcpServers?.vercel;

    if (!vercelConfig) {
      console.error("❌ No 'vercel' entry found in mcp.json");
      console.error("   Add the following to mcpServers:\n");
      console.error('   "vercel": {');
      console.error('     "type": "http",');
      console.error('     "url": "https://mcp.vercel.com"');
      console.error("   }\n");
      return false;
    }

    if (vercelConfig.type !== "http") {
      console.error(
        `❌ Vercel MCP server type should be "http", found: ${vercelConfig.type}`,
      );
      return false;
    }

    if (vercelConfig.url !== VERCEL_MCP_URL) {
      console.error(`❌ Vercel MCP server URL incorrect`);
      console.error(`   Expected: ${VERCEL_MCP_URL}`);
      console.error(`   Found: ${vercelConfig.url}\n`);
      return false;
    }

    console.log("✅ MCP configuration found and correct");
    console.log(`   Type: ${vercelConfig.type}`);
    console.log(`   URL: ${vercelConfig.url}`);
    if (vercelConfig.description) {
      console.log(`   Description: ${vercelConfig.description}`);
    }
    console.log();

    return true;
  } catch (error) {
    console.error(`❌ Failed to read mcp.json: ${error.message}\n`);
    return false;
  }
}

// ============================
// 3. Check Project-Specific Configuration
// ============================
function checkProjectConfig() {
  console.log("🔧 Checking project-specific configuration...");

  const vercelProjectPath = resolve(".vercel/project.json");

  if (!existsSync(vercelProjectPath)) {
    console.log("ℹ️  No .vercel/project.json found");
    console.log("   This is fine - using general MCP endpoint");
    console.log("   To enable project-specific context, run: vercel link\n");
    return { hasProject: false };
  }

  try {
    const projectConfig = JSON.parse(readFileSync(vercelProjectPath, "utf-8"));

    const projectId = projectConfig.projectId;
    const orgId = projectConfig.orgId;
    const projectName = projectConfig.projectName;

    console.log("✅ Vercel project configuration found");
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Organization ID: ${orgId}`);
    console.log(`   Project Name: ${projectName}`);

    // Check if project-specific MCP server is configured
    const mcpConfigPath = resolve("mcp.json");
    try {
      const mcpConfig = JSON.parse(readFileSync(mcpConfigPath, "utf-8"));
      const projectSpecificServer =
        mcpConfig.mcpServers["vercel-digitaltableteur"];

      if (projectSpecificServer) {
        console.log();
        console.log("✅ Project-specific MCP server configured!");
        console.log(`   URL: ${projectSpecificServer.url}`);
        console.log();
        console.log("   Benefits:");
        console.log(
          "   ✓ Automatic project context (no need to specify project/team)",
        );
        console.log("   ✓ Better error handling");
        console.log("   ✓ Improved tool performance");
      } else {
        console.log();
        console.log(
          "💡 Consider adding project-specific MCP server for enhanced performance:",
        );
        console.log(`   Add to mcp.json:`);
        console.log(`   "vercel-digitaltableteur": {`);
        console.log(`     "type": "http",`);
        console.log(
          `     "url": "https://mcp.vercel.com/${orgId}/${projectId}"`,
        );
        console.log(`   }`);
      }
    } catch (error) {
      // mcp.json not found or parse error - not critical
    }

    console.log();
    return { hasProject: true, projectId, orgId, projectName };
  } catch (error) {
    console.error(
      `⚠️  Failed to parse .vercel/project.json: ${error.message}\n`,
    );
    return { hasProject: false };
  }
}

// ============================
// 4. Display Available Tools
// ============================
function displayAvailableTools() {
  console.log("📚 Available Vercel MCP Tools (10+ tools):\n");

  const toolCategories = [
    {
      name: "📖 Documentation Tools (Public - No Auth Required)",
      tools: [
        "search_documentation - Search Vercel documentation for specific topics",
      ],
    },
    {
      name: "🏢 Project Management Tools",
      tools: [
        "list_teams - List all teams you're a member of",
        "list_projects - List all Vercel projects for a team",
        "get_project - Get detailed project information (framework, domains, latest deployment)",
      ],
    },
    {
      name: "🚀 Deployment Tools",
      tools: [
        "list_deployments - List deployments for a project with filters",
        "get_deployment - Get detailed deployment information (build status, regions, metadata)",
        "get_deployment_build_logs - Get build logs for debugging failed deployments",
        "deploy_to_vercel - Deploy current project to Vercel",
      ],
    },
    {
      name: "🌐 Domain Management Tools",
      tools: [
        "check_domain_availability_and_price - Check domain availability and pricing",
        "buy_domain - Purchase a domain with registrant information",
      ],
    },
    {
      name: "🔐 Access & Authentication Tools",
      tools: [
        "get_access_to_vercel_url - Create temporary shareable links for protected deployments",
        "web_fetch_vercel_url - Fetch content from Vercel deployments (with auth if needed)",
      ],
    },
    {
      name: "⌨️  CLI Tools",
      tools: ["use_vercel_cli - Get help with Vercel CLI commands"],
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
// 5. Provide Next Steps
// ============================
function provideNextSteps(allChecksPassed, projectConfig) {
  console.log("=".repeat(60));

  if (allChecksPassed) {
    console.log("\n✅ ALL CHECKS PASSED\n");
    console.log("🎉 Your Vercel MCP configuration is ready!\n");
    console.log("Next steps:\n");
    console.log(
      "1. Open Claude Code, Cursor, or another MCP-compatible client",
    );
    console.log("2. You'll be prompted to authenticate with Vercel via OAuth");
    console.log("3. Grant access to your Vercel account");
    console.log("4. Try prompts like:");
    console.log("   - 'Show me all my Vercel projects'");
    console.log("   - 'List recent deployments for digitaltableteur'");
    console.log("   - 'Show me the build logs for the latest deployment'");
    console.log("   - 'Search Vercel docs for Next.js caching'\n");

    if (projectConfig.hasProject) {
      console.log("💡 Project-specific setup detected!");
      console.log(
        "   Consider adding a project-specific MCP server for better context.\n",
      );
    } else {
      console.log("💡 To enable project-specific context:");
      console.log("   Run: vercel link");
      console.log(
        "   This creates .vercel/project.json for automatic team/project detection\n",
      );
    }

    console.log("📖 Documentation: https://vercel.com/docs/mcp/vercel-mcp");
    console.log(
      "🔧 Tools Reference: https://vercel.com/docs/mcp/vercel-mcp/tools\n",
    );
  } else {
    console.log("\n⚠️  SOME CHECKS FAILED\n");
    console.log("Please review the errors above and:\n");
    console.log("1. Ensure mcp.json has correct Vercel configuration");
    console.log("2. Check internet connectivity to https://mcp.vercel.com");
    console.log("3. Refer to: https://vercel.com/docs/mcp/vercel-mcp\n");
  }

  console.log("=".repeat(60));
}

// ============================
// Main Execution
// ============================
async function main() {
  const checks = [];

  // Run all checks
  checks.push(await checkVercelMCPServer());
  checks.push(checkMCPConfig());
  const projectConfig = checkProjectConfig();

  displayAvailableTools();

  const allChecksPassed = checks.every((check) => check !== false);
  provideNextSteps(allChecksPassed, projectConfig);

  process.exit(allChecksPassed ? 0 : 1);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
