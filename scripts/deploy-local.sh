#!/bin/bash

# Simple deployment script for local testing
# Usage: ./scripts/deploy-local.sh

set -e

echo "🏗️  Building main site..."
npm run build

echo "📚 Building Storybook..."
npm run build-storybook

echo "📁 Moving Storybook to subdirectory..."
mkdir -p dist/storybook
cp -r storybook-static/* dist/storybook/

echo "📄 Adding CNAME..."
echo "digitaltableteur.com" > dist/CNAME

echo "🚀 Deploying to GitHub Pages..."
npx gh-pages -d dist --dotfiles

echo "✅ Deployment complete!"
echo "🌐 Main site: https://digitaltableteur.com"
echo "📚 Storybook: https://digitaltableteur.com/storybook"