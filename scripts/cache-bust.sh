#!/bin/bash

# Cache busting script for production deployment
# This script helps ensure users get the latest version

echo "🔄 Starting cache busting process..."

# Add version timestamp to index.html
TIMESTAMP=$(date +%s)
echo "📅 Build timestamp: $TIMESTAMP"

# Create a version file for cache verification
echo "{\"version\": \"$TIMESTAMP\", \"date\": \"$(date)\", \"commit\": \"$(git rev-parse --short HEAD)\"}" > dist/version.json

# Add meta tag to index.html for cache busting
if [ -f "dist/index.html" ]; then
    # Add version meta tag to help with cache busting
    sed -i.bak "s/<head>/<head><meta name=\"build-version\" content=\"$TIMESTAMP\">/" dist/index.html
    rm dist/index.html.bak 2>/dev/null || true
    echo "✅ Added cache-busting meta tag to index.html"
fi

# Create .nojekyll file to prevent Jekyll processing on GitHub Pages
touch dist/.nojekyll
echo "✅ Created .nojekyll file"

echo "🎯 Cache busting complete!"
echo "🌐 New version: $TIMESTAMP"