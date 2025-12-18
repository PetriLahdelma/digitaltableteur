#!/bin/bash
set -e

echo "🚀 Akaunting Setup Script"
echo "========================="
echo ""

# Add Docker to PATH if installed via Docker Desktop on macOS
if [ -f "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
    export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not running. Please:"
    echo "   1. Install Docker Desktop: https://docs.docker.com/get-docker/"
    echo "   2. Launch Docker Desktop from Applications"
    echo "   3. Wait for the whale icon to appear in menu bar"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is installed but not running."
    echo "   Please start Docker Desktop and wait for it to fully start."
    echo "   You should see a whale icon in your menu bar."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available."
    echo "   This should be included with Docker Desktop."
    exit 1
fi

COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

cd "$(dirname "$0")"

# Generate APP_KEY if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    
    echo "🔑 Generating APP_KEY..."
    APP_KEY=$(docker run --rm akaunting/akaunting php artisan key:generate --show)
    
    # Replace the key in .env file using perl (more reliable for special characters)
    perl -i -pe "s|AKAUNTING_APP_KEY=.*|AKAUNTING_APP_KEY=$ENV{APP_KEY}|" .env
    
    export APP_KEY
    
    echo "✅ Generated APP_KEY: $APP_KEY"
else
    echo "⚠️  .env file already exists. Skipping generation."
fi

echo ""
echo "🐳 Starting Docker containers..."
$COMPOSE_CMD up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
echo "✅ Akaunting is starting up!"
echo ""
echo "📍 Access Akaunting at: http://localhost:8080"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:8080 in your browser"
echo "   2. Complete the initial setup wizard"
echo "   3. Go to Settings → Developer → API"
echo "   4. Create an API key"
echo "   5. Add the API key to akaunting/.env:"
echo "      AKAUNTING_API_KEY=your_api_key_here"
echo "   6. Run: npm run akaunting:mcp:setup"
echo ""
echo "📊 Docker commands:"
echo "   View logs:    cd akaunting && $COMPOSE_CMD logs -f"
echo "   Stop:         cd akaunting && $COMPOSE_CMD stop"
echo "   Restart:      cd akaunting && $COMPOSE_CMD restart"
echo "   Remove:       cd akaunting && $COMPOSE_CMD down"
echo ""
