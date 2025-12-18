# Docker MCP Server Setup Guide

Complete guide for using Docker's official Model Context Protocol (MCP) server for container management through AI assistants.

## 📋 Overview

The [Docker MCP Server](https://github.com/docker/mcp-server-docker) provides comprehensive access to your local Docker environment directly through AI assistants like GitHub Copilot, Claude, and Cursor. It's an official Docker-maintained MCP server that runs locally.

### Key Features

- **30+ Docker Operations** for containers, images, networks, and volumes
- **Local Docker Daemon** - Direct connection to your Docker installation
- **Real-time Management** - Start, stop, inspect, and manage resources
- **Log Streaming** - View container logs and execution output
- **Docker Compose Support** - Manage multi-container applications
- **System Monitoring** - CPU, memory, network usage stats

### Architecture

```
┌─────────────────┐
│ MCP Client      │
│ (VS Code,       │
│  Copilot, etc.) │
└────────┬────────┘
         │ stdio/command
         │
┌────────▼────────────────────┐
│ Docker MCP Server           │
│ (npx @docker/mcp-server)    │
└────────┬────────────────────┘
         │ Docker API
         │
┌────────▼────────┐
│ Docker Daemon   │
│ (Local)         │
└─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

1. **Docker Desktop** or **Docker Engine** installed and running
2. **VS Code** with GitHub Copilot extension
3. **MCP support** in VS Code (recent versions)

### VS Code with GitHub Copilot Setup

#### Installation via MCP Catalog (Recommended)

1. Open Command Palette (`Ctrl+Shift+P` on Windows/Linux or `Cmd+Shift+P` on macOS)
2. Run: `MCP: Show Catalog`
3. Search for "Docker"
4. Click "Add to Workspace" or "Add Globally"
5. VS Code will automatically configure the Docker MCP server

#### Manual Installation

1. Open Command Palette
2. Run: `MCP: Add Server`
3. Select `Command`
4. Enter details:
   - **Name**: `docker`
   - **Command**: `npx`
   - **Args**: `@docker/mcp-server`
5. Select `Workspace` (recommended for project-specific use)
6. Click `Add`

#### Verification

1. Command Palette → `MCP: List Servers`
2. You should see `docker` in the list
3. Status should be "Running" when Docker daemon is active

---

## 🛠️ Available Tools (30+ Operations)

### 📦 Container Management (9 tools)

| Tool                  | Description                     | Example                       |
| --------------------- | ------------------------------- | ----------------------------- |
| `list_containers`     | List all or filtered containers | "Show all running containers" |
| `start_container`     | Start a stopped container       | "Start akaunting-app"         |
| `stop_container`      | Stop a running container        | "Stop all containers"         |
| `restart_container`   | Restart a container             | "Restart the database"        |
| `remove_container`    | Remove a container              | "Remove stopped containers"   |
| `get_container_logs`  | View container logs             | "Show logs for akaunting-app" |
| `inspect_container`   | Get detailed container info     | "Inspect akaunting-app"       |
| `exec_in_container`   | Execute commands in container   | "Run 'ls' in akaunting-app"   |
| `get_container_stats` | View CPU/memory/network usage   | "Show container stats"        |

### 🖼️ Image Management (8 tools)

| Tool                | Description              | Example                        |
| ------------------- | ------------------------ | ------------------------------ |
| `list_images`       | List all Docker images   | "What images do I have?"       |
| `pull_image`        | Pull image from registry | "Pull latest nginx"            |
| `build_image`       | Build from Dockerfile    | "Build image from ./akaunting" |
| `tag_image`         | Tag an image             | "Tag my-app as v1.0"           |
| `remove_image`      | Remove an image          | "Remove nginx image"           |
| `inspect_image`     | Get detailed image info  | "Inspect nginx image"          |
| `get_image_history` | View image layer history | "Show nginx history"           |
| `prune_images`      | Remove unused images     | "Clean up unused images"       |

### 🌐 Network Management (6 tools)

| Tool                      | Description                  | Example                      |
| ------------------------- | ---------------------------- | ---------------------------- |
| `list_networks`           | List all networks            | "Show Docker networks"       |
| `create_network`          | Create a new network         | "Create network 'my-net'"    |
| `remove_network`          | Remove a network             | "Remove network 'old-net'"   |
| `connect_to_network`      | Connect container to network | "Connect app to my-net"      |
| `disconnect_from_network` | Disconnect from network      | "Disconnect app from bridge" |
| `inspect_network`         | Get detailed network info    | "Inspect bridge network"     |

### 💾 Volume Management (5 tools)

| Tool             | Description              | Example                    |
| ---------------- | ------------------------ | -------------------------- |
| `list_volumes`   | List all volumes         | "Show all volumes"         |
| `create_volume`  | Create a new volume      | "Create volume 'db-data'"  |
| `remove_volume`  | Remove a volume          | "Remove volume 'old-data'" |
| `inspect_volume` | Get detailed volume info | "Inspect db-data volume"   |
| `prune_volumes`  | Remove unused volumes    | "Clean up unused volumes"  |

### 🔧 Docker Compose (4 tools)

| Tool           | Description              | Example                    |
| -------------- | ------------------------ | -------------------------- |
| `compose_up`   | Start services           | "Start Akaunting services" |
| `compose_down` | Stop and remove services | "Stop Akaunting"           |
| `compose_logs` | View service logs        | "Show Akaunting logs"      |
| `compose_ps`   | List services            | "List compose services"    |

### 🔍 System & Info (3 tools)

| Tool                 | Description               | Example                  |
| -------------------- | ------------------------- | ------------------------ |
| `get_docker_info`    | Docker daemon information | "Show Docker info"       |
| `get_docker_version` | Get Docker version        | "What Docker version?"   |
| `prune_system`       | Clean up unused resources | "Clean up Docker system" |

---

## 💡 Usage Examples

### Container Operations

**List & Inspect:**

```
"List all running Docker containers"
"Show all containers including stopped ones"
"Inspect the akaunting-app container"
"What ports is akaunting-app using?"
```

**Start/Stop/Restart:**

```
"Start the akaunting-app container"
"Stop the database container"
"Restart all services"
"Stop all running containers"
```

**Logs & Monitoring:**

```
"Show logs for akaunting-app"
"Show the last 50 lines of akaunting-app logs"
"Show CPU and memory usage for all containers"
"Monitor container akaunting-app performance"
```

**Execute Commands:**

```
"Execute 'ls -la' in the akaunting-app container"
"Run 'php artisan migrate' in akaunting-app"
"Check PHP version in akaunting-app"
```

### Image Operations

**List & Pull:**

```
"List all Docker images"
"Pull the latest nginx image"
"Pull mysql:8.0 image"
"Show image history for nginx"
```

**Build & Tag:**

```
"Build an image from the Dockerfile in akaunting/"
"Build and tag as akaunting:dev"
"Tag my-app:latest as my-app:v1.0"
```

**Clean Up:**

```
"Remove unused Docker images"
"Remove the nginx image"
"Show dangling images"
```

### Network Operations

```
"List all Docker networks"
"Create a new network called akaunting-net"
"Show which containers are on the bridge network"
"Connect akaunting-app to akaunting-net"
"Disconnect app from default network"
"Inspect the akaunting-net network"
```

### Volume Operations

```
"List all Docker volumes"
"Create a new volume called akaunting-data"
"Remove unused volumes"
"Show details for volume akaunting-data"
"Inspect volume akaunting-db-data"
```

### Docker Compose (Akaunting Project)

```
"Start the Akaunting services using docker-compose"
"Show logs for all Akaunting services"
"Show logs for the akaunting-app service"
"Stop Akaunting services"
"Restart Akaunting services"
"List all Akaunting compose services"
```

### System Maintenance

```
"Show Docker system information"
"What Docker version am I running?"
"Clean up all unused Docker resources"
"Show disk space used by Docker"
```

---

## 🎯 Akaunting-Specific Examples

Since your project uses Akaunting with Docker, here are tailored examples:

### Setup & Management

```
"Start the Akaunting application"
"Show status of Akaunting containers"
"Restart the Akaunting database"
"Check if Akaunting is running"
```

### Troubleshooting

```
"Show Akaunting app logs"
"Why is Akaunting not responding?"
"Check database connection for Akaunting"
"Show errors in Akaunting logs"
"Inspect the akaunting-app container configuration"
```

### Database Operations

```
"Execute database backup in Akaunting"
"Run migrations in Akaunting"
"Connect to Akaunting database shell"
"Show database volume details"
```

### Performance Monitoring

```
"Show resource usage for Akaunting containers"
"Is Akaunting using too much memory?"
"Check CPU usage for the app container"
"Monitor network traffic for Akaunting"
```

---

## 🔧 Configuration

### Project-Specific Configuration (mcp.json)

If you want to add Docker MCP to `mcp.json` manually:

```json
{
  "mcpServers": {
    "docker": {
      "type": "command",
      "command": "npx",
      "args": ["@docker/mcp-server"],
      "description": "Docker MCP Server - Local container management (30+ tools)"
    }
  }
}
```

### VS Code Workspace Settings

Docker MCP is typically configured per-workspace in:

```
.vscode/mcp-settings.json
```

Or globally in VS Code settings.

---

## ✅ Testing

Run the test script to verify your setup:

```bash
node scripts/test-docker-mcp.mjs
```

**What it checks:**

- ✅ Docker daemon running
- ✅ MCP configuration present
- ✅ Docker environment info (containers, images, volumes, networks)
- ✅ Lists all 30+ available tools
- ✅ Provides usage examples

---

## 🚨 Troubleshooting

### "Docker daemon not running"

**Solution:**

1. Start Docker Desktop
2. Or: `brew services start docker` (macOS with Homebrew)
3. Or: `sudo systemctl start docker` (Linux)

### "Docker MCP not showing in VS Code"

**Solution:**

1. Command Palette → `MCP: List Servers`
2. If not listed → `MCP: Show Catalog` → Add Docker
3. Restart VS Code
4. Check Docker Desktop is running

### "Cannot connect to Docker daemon"

**Solution:**

1. Verify Docker is running: `docker info`
2. Check Docker socket permissions (Linux): `ls -la /var/run/docker.sock`
3. Add user to docker group (Linux): `sudo usermod -aG docker $USER`
4. Restart terminal/VS Code

### "MCP tools not responding"

**Solution:**

1. Stop Docker MCP server: Command Palette → `MCP: Stop Server` → Select `docker`
2. Restart: `MCP: Start Server` → Select `docker`
3. Check logs: `MCP: Show Server Logs` → Select `docker`

### "Permission denied" errors

**Solution (macOS/Linux):**

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Reload groups
newgrp docker

# Test
docker ps
```

---

## 🔐 Security Best Practices

### Container Execution

- ✅ **Review commands** before executing in containers
- ⚠️ **Exec access** gives full container shell access
- ✅ **Use read-only** operations when possible (logs, inspect)
- ⚠️ **Destructive operations** (remove, prune) require confirmation

### Network & Volumes

- ✅ **Inspect before connecting** containers to networks
- ⚠️ **Volume deletion** is permanent and cannot be undone
- ✅ **Back up data** before prune operations
- ✅ **Review compose files** before running compose_up

### AI Assistant Safety

- ✅ **Enable human confirmation** for destructive operations
- ⚠️ **Prompt injection** - Beware of malicious instructions in logs
- ✅ **Verify commands** before execution, especially with production data
- ✅ **Use workspace-specific** MCP config to limit scope

---

## 📊 Integration with Akaunting

Your Akaunting setup (`akaunting/docker-compose.yml`) works seamlessly with Docker MCP:

### Akaunting Services

```yaml
services:
  akaunting-app: # PHP application
  akaunting-db: # MySQL database
  akaunting-web: # Nginx web server
```

### Common Workflows

**Start Akaunting:**

```
"Start Akaunting with docker-compose"
→ Executes: docker-compose -f akaunting/docker-compose.yml up -d
```

**Check Status:**

```
"Show status of Akaunting services"
→ Lists: akaunting-app, akaunting-db, akaunting-web
```

**View Logs:**

```
"Show logs for Akaunting app"
→ Streams logs from akaunting-app container
```

**Database Management:**

```
"Execute 'mysql -u root -p' in Akaunting database"
→ Opens MySQL shell in akaunting-db container
```

---

## 🎓 Best Practices

### 1. Use Descriptive Container Names

```yaml
# Good
container_name: akaunting-app

# Avoid
container_name: app1
```

Helps AI assistants identify containers accurately.

### 2. Leverage Labels

```yaml
labels:
  - "com.example.description=Akaunting Application"
  - "com.example.team=finance"
```

Enables filtering: "Show all finance team containers"

### 3. Health Checks

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost"]
  interval: 30s
```

AI can query: "Show unhealthy containers"

### 4. Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: "2"
      memory: 2G
```

Enables: "Show containers exceeding memory limits"

---

## 📖 Additional Resources

- **Official Repository**: https://github.com/docker/mcp-server-docker
- **Docker Documentation**: https://docs.docker.com
- **MCP Protocol**: https://modelcontextprotocol.io
- **VS Code MCP Docs**: Search for "Model Context Protocol" in VS Code docs

---

## 🔄 Updates & Maintenance

### Updating Docker MCP

Docker MCP auto-updates via `npx`. To force update:

```bash
npm cache clean --force
npx @docker/mcp-server@latest
```

### Version Check

```bash
npx @docker/mcp-server --version
```

---

## 📝 Quick Reference

### Essential Commands (via AI)

| Task            | Prompt                      |
| --------------- | --------------------------- |
| List containers | "Show all containers"       |
| Start service   | "Start akaunting-app"       |
| View logs       | "Show akaunting logs"       |
| Execute command | "Run 'ls' in akaunting-app" |
| Clean up        | "Remove stopped containers" |
| Monitor         | "Show container stats"      |

### VS Code Commands

| Command                 | Action                       |
| ----------------------- | ---------------------------- |
| `MCP: Show Catalog`     | Browse available MCP servers |
| `MCP: List Servers`     | View configured servers      |
| `MCP: Start Server`     | Start Docker MCP             |
| `MCP: Stop Server`      | Stop Docker MCP              |
| `MCP: Show Server Logs` | View MCP server logs         |

---

**Status**: ✅ Ready for use with VS Code GitHub Copilot  
**Setup Time**: ~5 minutes  
**Requirement**: Docker Desktop running  
**Tools**: 30+ container management operations
