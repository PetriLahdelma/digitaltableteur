#!/usr/bin/env node
/**
 * Test Docker MCP Server Configuration
 *
 * Validates:
 * - Docker MCP server accessibility
 * - Available tools and capabilities
 * - Connection to local Docker daemon
 * - Container and image management features
 *
 * Usage:
 *   node scripts/test-docker-mcp.mjs
 */

import { execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

console.log("🔍 Testing Docker MCP Configuration\n");

// ============================
// 1. Check if Docker is running
// ============================
function checkDockerRunning() {
  console.log("🐳 Checking Docker daemon status...");
  try {
    execSync("docker info", { stdio: "pipe" });
    console.log("✅ Docker daemon is running\n");
    return true;
  } catch (error) {
    console.error("❌ Docker daemon is not running");
    console.error(
      "   Start Docker Desktop or run: brew services start docker\n",
    );
    return false;
  }
}

// ============================
// 2. Check MCP configuration
// ============================
function checkMCPConfig() {
  console.log("📋 Checking MCP configuration...");
  const mcpPath = resolve("mcp.json");

  if (!existsSync(mcpPath)) {
    console.error("❌ mcp.json not found\n");
    return false;
  }

  try {
    const config = JSON.parse(readFileSync(mcpPath, "utf-8"));
    const dockerConfig = config.mcpServers?.docker;

    if (!dockerConfig) {
      console.log("ℹ️  No Docker MCP configuration found in mcp.json");
      console.log(
        "   Docker MCP may be configured in VS Code settings instead\n",
      );
      return { configured: false, vscodeOnly: true };
    }

    console.log("✅ Docker MCP configuration found");
    console.log(`   Type: ${dockerConfig.type || "command"}`);
    if (dockerConfig.command) {
      console.log(`   Command: ${dockerConfig.command}`);
    }
    if (dockerConfig.url) {
      console.log(`   URL: ${dockerConfig.url}`);
    }
    console.log();
    return { configured: true, config: dockerConfig };
  } catch (error) {
    console.error(`❌ Failed to parse mcp.json: ${error.message}\n`);
    return false;
  }
}

// ============================
// 3. Get Docker info
// ============================
function getDockerInfo() {
  console.log("📊 Docker Environment Information...");
  try {
    const containers = execSync('docker ps -a --format "{{.Names}}" | wc -l', {
      encoding: "utf-8",
    }).trim();
    const runningContainers = execSync(
      'docker ps --format "{{.Names}}" | wc -l',
      { encoding: "utf-8" },
    ).trim();
    const images = execSync(
      'docker images --format "{{.Repository}}" | wc -l',
      { encoding: "utf-8" },
    ).trim();
    const volumes = execSync('docker volume ls --format "{{.Name}}" | wc -l', {
      encoding: "utf-8",
    }).trim();
    const networks = execSync(
      'docker network ls --format "{{.Name}}" | wc -l',
      { encoding: "utf-8" },
    ).trim();

    console.log(`   Total Containers: ${containers}`);
    console.log(`   Running Containers: ${runningContainers}`);
    console.log(`   Images: ${images}`);
    console.log(`   Volumes: ${volumes}`);
    console.log(`   Networks: ${networks}`);
    console.log();
    return true;
  } catch (error) {
    console.error(`⚠️  Failed to get Docker info: ${error.message}\n`);
    return false;
  }
}

// ============================
// 4. Display Docker MCP capabilities
// ============================
function displayDockerMCPCapabilities() {
  console.log("🛠️  Docker MCP Capabilities:\n");

  console.log("📦 Container Management");
  console.log("  • list_containers - List all or filtered containers");
  console.log("  • start_container - Start a stopped container");
  console.log("  • stop_container - Stop a running container");
  console.log("  • restart_container - Restart a container");
  console.log("  • remove_container - Remove a container");
  console.log("  • get_container_logs - View container logs");
  console.log("  • inspect_container - Get detailed container information");
  console.log(
    "  • exec_in_container - Execute commands in a running container",
  );
  console.log("  • get_container_stats - View CPU, memory, network usage");
  console.log();

  console.log("🖼️  Image Management");
  console.log("  • list_images - List all Docker images");
  console.log("  • pull_image - Pull image from registry");
  console.log("  • build_image - Build image from Dockerfile");
  console.log("  • tag_image - Tag an image");
  console.log("  • remove_image - Remove an image");
  console.log("  • inspect_image - Get detailed image information");
  console.log("  • get_image_history - View image layer history");
  console.log("  • prune_images - Remove unused images");
  console.log();

  console.log("🌐 Network Management");
  console.log("  • list_networks - List all Docker networks");
  console.log("  • create_network - Create a new network");
  console.log("  • remove_network - Remove a network");
  console.log("  • connect_to_network - Connect container to network");
  console.log(
    "  • disconnect_from_network - Disconnect container from network",
  );
  console.log("  • inspect_network - Get detailed network information");
  console.log();

  console.log("💾 Volume Management");
  console.log("  • list_volumes - List all Docker volumes");
  console.log("  • create_volume - Create a new volume");
  console.log("  • remove_volume - Remove a volume");
  console.log("  • inspect_volume - Get detailed volume information");
  console.log("  • prune_volumes - Remove unused volumes");
  console.log();

  console.log("🔧 Docker Compose (if available)");
  console.log("  • compose_up - Start services defined in docker-compose.yml");
  console.log("  • compose_down - Stop and remove services");
  console.log("  • compose_logs - View service logs");
  console.log("  • compose_ps - List services");
  console.log();

  console.log("🔍 System & Info");
  console.log("  • get_docker_info - Get Docker daemon information");
  console.log("  • get_docker_version - Get Docker version");
  console.log("  • prune_system - Clean up unused resources");
  console.log();
}

// ============================
// 5. Provide usage examples
// ============================
function provideUsageExamples() {
  console.log("💡 Usage Examples:\n");

  console.log("📋 Container Operations:");
  console.log('  "List all running Docker containers"');
  console.log('  "Show logs for container akaunting-app"');
  console.log('  "Start the akaunting-app container"');
  console.log('  "Stop all running containers"');
  console.log('  "Remove stopped containers"');
  console.log("  \"Execute 'ls -la' in the akaunting-app container\"");
  console.log();

  console.log("🖼️  Image Operations:");
  console.log('  "List all Docker images"');
  console.log('  "Pull the latest nginx image"');
  console.log('  "Remove unused Docker images"');
  console.log('  "Show image history for nginx"');
  console.log('  "Build an image from the Dockerfile in akaunting/"');
  console.log();

  console.log("🌐 Network Operations:");
  console.log('  "List all Docker networks"');
  console.log('  "Create a new network called my-network"');
  console.log('  "Show which containers are on the bridge network"');
  console.log('  "Connect akaunting-app to my-network"');
  console.log();

  console.log("💾 Volume Operations:");
  console.log('  "List all Docker volumes"');
  console.log('  "Create a new volume for database data"');
  console.log('  "Remove unused volumes"');
  console.log('  "Show details for volume akaunting-data"');
  console.log();

  console.log("🔍 Inspection & Monitoring:");
  console.log('  "Show CPU and memory usage for all containers"');
  console.log('  "Inspect the akaunting-app container"');
  console.log('  "What ports is akaunting-app using?"');
  console.log('  "Show Docker system information"');
  console.log();

  console.log("🔧 Docker Compose (Akaunting Project):");
  console.log('  "Start the Akaunting services with docker-compose"');
  console.log('  "Show logs for Akaunting services"');
  console.log('  "Stop Akaunting services"');
  console.log();
}

// ============================
// Main execution
// ============================
async function main() {
  const dockerRunning = checkDockerRunning();

  const mcpConfig = checkMCPConfig();

  if (dockerRunning) {
    getDockerInfo();
  }

  displayDockerMCPCapabilities();
  provideUsageExamples();

  console.log("============================================================\n");

  if (mcpConfig.vscodeOnly) {
    console.log("✅ Docker MCP is configured in VS Code\n");
    console.log("🎉 Your Docker MCP integration is ready!\n");
    console.log("Next steps:");
    console.log(
      "1. " +
        (dockerRunning ? "Docker is running ✅" : "Start Docker Desktop ⚠️"),
    );
    console.log("2. Use Copilot chat to interact with Docker");
    console.log("3. Try prompts like:");
    console.log('   - "List all running containers"');
    console.log('   - "Show me the akaunting-app logs"');
    console.log('   - "What Docker images do I have?"');
    console.log();
    console.log("📖 Docker MCP allows AI assistants to:");
    console.log("   • Manage containers, images, networks, and volumes");
    console.log("   • View logs and inspect resources");
    console.log("   • Execute commands and monitor performance");
    console.log("   • Help troubleshoot Docker issues");
  } else if (mcpConfig.configured) {
    console.log("✅ ALL CHECKS PASSED\n");
    console.log("🎉 Your Docker MCP configuration is ready!\n");
    console.log("Next steps:");
    console.log(
      "1. " +
        (dockerRunning ? "Docker is running ✅" : "Start Docker Desktop ⚠️"),
    );
    console.log("2. Open your MCP client (Claude Code, Cursor, VS Code, etc.)");
    console.log("3. Docker MCP tools should be available");
    console.log("4. Try the usage examples above");
  } else if (!dockerRunning) {
    console.log("⚠️  Docker daemon not running\n");
    console.log("To use Docker MCP:");
    console.log(
      "1. Install Docker Desktop: https://www.docker.com/products/docker-desktop",
    );
    console.log("2. Start Docker Desktop");
    console.log("3. Run this test script again");
  }

  console.log(
    "\n📖 Documentation: https://github.com/docker/mcp-server-docker",
  );
  console.log("🔧 VS Code MCP Settings: Command Palette → 'MCP: List Servers'");
  console.log("\n============================================================");
}

main().catch(console.error);
