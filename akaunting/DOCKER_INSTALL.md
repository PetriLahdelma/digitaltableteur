# Docker Installation Guide for macOS

## Quick Install (Recommended)

### Option 1: Docker Desktop (GUI)

1. Download Docker Desktop for Mac:
   - **Apple Silicon (M1/M2/M3)**: https://desktop.docker.com/mac/main/arm64/Docker.dmg
   - **Intel**: https://desktop.docker.com/mac/main/amd64/Docker.dmg

2. Install:

   ```bash
   # Open the downloaded .dmg file
   # Drag Docker to Applications folder
   # Launch Docker from Applications
   ```

3. Verify installation:
   ```bash
   docker --version
   docker compose version
   ```

### Option 2: Homebrew (CLI)

```bash
# Install Docker Desktop via Homebrew
brew install --cask docker

# Launch Docker Desktop
open -a Docker

# Wait for Docker to start (whale icon in menu bar)

# Verify
docker --version
docker compose version
```

## System Requirements

- **macOS**: 11 Big Sur or newer
- **RAM**: 4GB minimum (8GB recommended)
- **Disk**: 20GB available space

## After Installation

Once Docker is running:

```bash
# Install Akaunting
npm run akaunting:install

# This will automatically:
# - Pull Akaunting and MariaDB images (~500MB)
# - Generate secure APP_KEY
# - Start containers
# - Expose API on http://localhost:8080
```

## Troubleshooting

### Docker Desktop won't start

1. Check if virtualization is enabled in BIOS/UEFI
2. Restart your Mac
3. Try re-installing Docker Desktop

### Permission denied

```bash
# Add your user to docker group (not typically needed on macOS)
sudo usermod -aG docker $USER
# Log out and back in
```

### Port conflicts

If port 8080 is already in use, edit `akaunting/docker-compose.yml`:

```yaml
ports:
  - "8081:80" # Use different port
```

## Alternative: Colima (Lightweight)

If you prefer a lightweight Docker runtime without Docker Desktop:

```bash
# Install Colima
brew install colima docker docker-compose

# Start Colima
colima start

# Verify
docker --version
```

## Next Steps

After Docker is installed and running:

1. ✅ Run `npm run akaunting:install`
2. ✅ Open http://localhost:8080
3. ✅ Complete setup wizard
4. ✅ Enable API access
5. ✅ Configure MCP integration

See `akaunting/INSTALLATION_COMPLETE.md` for detailed steps.

## Resources

- Docker Desktop: https://docs.docker.com/desktop/install/mac-install/
- Colima: https://github.com/abiosoft/colima
- Homebrew: https://brew.sh
