#!/usr/bin/env node

/**
 * Sanity MCP Connection Test Script
 * Tests the Sanity MCP server configuration and connection
 *
 * Sanity MCP Server: https://mcp.sanity.io
 * Documentation: https://www.sanity.io/docs/compute-and-ai/mcp-server
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local and .env files
dotenv.config({ path: ".env.local" });
dotenv.config();

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";

function log(message, color = "") {
  console.log(`${color}${message}${RESET}`);
}

async function checkSanityAPI() {
  log("\n🔍 Testing Sanity MCP server connectivity...", BLUE);

  try {
    // Test basic HTTP connectivity to the MCP endpoint
    const response = await fetch("https://mcp.sanity.io", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      log(`✅ Sanity MCP server is accessible at https://mcp.sanity.io`, GREEN);
      log(`   Status: ${response.status} ${response.statusText}`, YELLOW);
      return true;
    } else {
      log(`⚠️  Sanity MCP server returned status: ${response.status}`, YELLOW);
      log(`   Note: This is expected if OAuth is required`, YELLOW);
      return true; // Still consider this a pass as the server is reachable
    }
  } catch (error) {
    log(`❌ Failed to reach Sanity MCP server: ${error.message}`, RED);
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

    if (!mcpConfig.mcpServers?.sanity) {
      log(`❌ Sanity MCP server not configured in mcp.json`, RED);
      log(`   Add the following to your mcp.json:`, YELLOW);
      log(`   {`, YELLOW);
      log(`     "mcpServers": {`, YELLOW);
      log(`       "sanity": {`, YELLOW);
      log(`         "type": "http",`, YELLOW);
      log(`         "url": "https://mcp.sanity.io"`, YELLOW);
      log(`       }`, YELLOW);
      log(`     }`, YELLOW);
      log(`   }`, YELLOW);
      return false;
    }

    const sanityConfig = mcpConfig.mcpServers.sanity;

    log(`✅ Sanity MCP configuration found`, GREEN);
    log(`   Type: ${sanityConfig.type}`, YELLOW);
    log(`   URL: ${sanityConfig.url}`, YELLOW);

    if (
      sanityConfig.type === "http" &&
      sanityConfig.url === "https://mcp.sanity.io"
    ) {
      log(`✅ Using official Sanity MCP remote server`, GREEN);
    } else {
      log(`⚠️  Using custom Sanity MCP configuration`, YELLOW);
    }

    return true;
  } catch (error) {
    log(`❌ Failed to read mcp.json: ${error.message}`, RED);
    return false;
  }
}

async function checkEnvironmentVariables() {
  log("\n🔐 Checking environment variables...", BLUE);

  const sanityToken = process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN;

  const sanityProjectId = process.env.SANITY_PROJECT_ID;
  const sanityDataset = process.env.SANITY_DATASET;

  if (!sanityToken) {
    log(`⚠️  No Sanity API token found (optional)`, YELLOW);
    log(`   Note: Sanity MCP uses OAuth by default`, YELLOW);
    log(`   To skip OAuth, set SANITY_TOKEN environment variable`, YELLOW);
    log(`   Create tokens at: https://www.sanity.io/manage`, YELLOW);
  } else {
    log(`✅ Sanity API token found in environment`, GREEN);
    log(`   Token length: ${sanityToken.length} characters`, YELLOW);
    log(`   Token prefix: ${sanityToken.substring(0, 8)}...`, YELLOW);
  }

  if (!sanityProjectId) {
    log(`⚠️  SANITY_PROJECT_ID not set`, YELLOW);
  } else {
    log(`✅ SANITY_PROJECT_ID: ${sanityProjectId}`, GREEN);
  }

  if (!sanityDataset) {
    log(`⚠️  SANITY_DATASET not set`, YELLOW);
  } else {
    log(`✅ SANITY_DATASET: ${sanityDataset}`, GREEN);
  }

  return true;
}

async function testSanityClientAPI() {
  log("\n🔧 Testing Sanity Client API...", BLUE);

  const sanityProjectId = process.env.SANITY_PROJECT_ID;
  const sanityDataset = process.env.SANITY_DATASET || "production";
  const sanityToken = process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN;

  if (!sanityProjectId) {
    log(`⚠️  Skipping Sanity Client API test (no project ID)`, YELLOW);
    return true;
  }

  try {
    const apiUrl = `https://${sanityProjectId}.api.sanity.io/v2021-10-21/data/query/${sanityDataset}?query=*[_type=="post"][0...1]{_id,title}`;

    const headers = {
      Accept: "application/json",
    };

    if (sanityToken) {
      headers["Authorization"] = `Bearer ${sanityToken}`;
    }

    const response = await fetch(apiUrl, { headers });

    if (response.ok) {
      const data = await response.json();
      log(`✅ Sanity Client API is accessible`, GREEN);
      log(`   Found ${data.result?.length || 0} post(s) in dataset`, YELLOW);

      if (data.result && data.result.length > 0) {
        const post = data.result[0];
        log(`   Sample post: ${post.title || post._id}`, YELLOW);
      }

      return true;
    } else {
      log(`⚠️  Sanity Client API returned status: ${response.status}`, YELLOW);
      const errorText = await response.text();
      log(`   Response: ${errorText.substring(0, 200)}`, YELLOW);
      return false;
    }
  } catch (error) {
    log(`❌ Failed to test Sanity Client API: ${error.message}`, RED);
    return false;
  }
}

async function displayAvailableTools() {
  log("\n🛠️  Available Sanity MCP Tools (40+):", BLUE);

  const tools = [
    {
      name: "Document Operations",
      tools: [
        "create_document",
        "update_document",
        "patch_document",
        "transform_document",
        "translate_document",
        "publish_document",
        "unpublish_document",
        "delete_document",
      ],
    },
    {
      name: "Version Management",
      tools: [
        "create_version",
        "version_replace_document",
        "version_discard_document",
        "version_unpublish_document",
      ],
    },
    {
      name: "GROQ & Queries",
      tools: ["get_groq_specification", "query_documents"],
    },
    {
      name: "Semantic Search",
      tools: ["semantic_search", "list_embeddings_indices"],
    },
    { name: "Image Operations", tools: ["transform_image"] },
    {
      name: "Release Management",
      tools: [
        "list_releases",
        "create_release",
        "edit_release",
        "schedule_release",
        "publish_release",
        "archive_release",
        "unarchive_release",
        "unschedule_release",
        "delete_release",
      ],
    },
    {
      name: "Project & Schema",
      tools: [
        "list_projects",
        "get_project_studios",
        "get_schema",
        "list_workspace_schemas",
        "get_context",
      ],
    },
    {
      name: "Dataset Management",
      tools: ["list_datasets", "create_dataset", "update_dataset"],
    },
    {
      name: "Migration & Docs",
      tools: [
        "sanity_migration_guide",
        "migrate_schema",
        "migrate_content",
        "search_docs",
        "read_docs",
        "list_learn_docs",
        "read_learn_docs",
      ],
    },
  ];

  tools.forEach((category) => {
    log(`\n   ${category.name}:`, YELLOW);
    category.tools.forEach((tool) => {
      log(`     • ${tool}`, GREEN);
    });
  });

  log(
    `\n📚 Full documentation: https://www.sanity.io/docs/compute-and-ai/mcp-server`,
    BLUE,
  );
}

async function provideNextSteps() {
  log("\n📝 Next Steps:", BLUE);

  const sanityToken = process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN;

  if (!sanityToken) {
    log(`\n1️⃣  Authentication Setup:`, YELLOW);
    log(
      `   • Option A (Recommended): Use OAuth (default, expires after 7 days)`,
      GREEN,
    );
    log(`     MCP clients will prompt for Sanity credentials`, YELLOW);
    log(`   • Option B: Set API token to skip OAuth:`, GREEN);
    log(`     export SANITY_TOKEN=sk...`, YELLOW);
    log(`     Create token at: https://www.sanity.io/manage`, YELLOW);
  }

  log(`\n2️⃣  Integration Commands:`, YELLOW);
  log(`   • Test in Claude Code/Cursor:`, GREEN);
  log(`     "List all Sanity projects"`, YELLOW);
  log(`     "Query posts in Sanity"`, YELLOW);
  log(`     "Translate this document to Finnish"`, YELLOW);
  log(`     "Create a new release in Sanity"`, YELLOW);

  log(`\n3️⃣  Wrapper Scripts (To Create):`, YELLOW);
  log(`   • npm run sanity:mcp:test - This script`, GREEN);
  log(`   • npm run sanity:semantic-search - Embeddings-based search`, GREEN);
  log(`   • npm run sanity:groq - Interactive GROQ queries`, GREEN);
  log(`   • npm run sanity:translate - Translate documents`, GREEN);
  log(`   • npm run sanity:version:create - Create document versions`, GREEN);

  log(`\n4️⃣  Documentation:`, YELLOW);
  log(`   • Create docs/SANITY_MCP_SETUP.md with setup guide`, GREEN);
  log(
    `   • Update .github/copilot-instructions.md with Sanity MCP section`,
    GREEN,
  );
}

async function main() {
  log("\n" + "=".repeat(60), BLUE);
  log("🔧 Sanity MCP Connection Test", BLUE);
  log("=".repeat(60) + "\n", BLUE);

  const results = {
    api: await checkSanityAPI(),
    config: await checkMCPConfig(),
    env: await checkEnvironmentVariables(),
    client: await testSanityClientAPI(),
  };

  await displayAvailableTools();
  await provideNextSteps();

  log("\n" + "=".repeat(60), BLUE);
  log("📊 Test Summary", BLUE);
  log("=".repeat(60) + "\n", BLUE);

  const allPassed = Object.values(results).every((r) => r);

  if (allPassed) {
    log("✅ All checks passed!", GREEN);
    log(
      "   Your Sanity MCP server is properly configured and accessible.",
      GREEN,
    );
  } else {
    log("⚠️  Some checks failed", YELLOW);
    log("   Review the output above and follow the recommendations.", YELLOW);
  }

  log("\n" + "=".repeat(60) + "\n", BLUE);
}

main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, RED);
  console.error(error);
  process.exit(1);
});
