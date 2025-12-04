#!/bin/bash

# Publish articles from Sanity CMS to the Next.js blog
# Usage:
#   ./scripts/publish-from-sanity.sh                    # Sync all articles
#   ./scripts/publish-from-sanity.sh <article-slug>     # Sync single article

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SLUG="$1"

echo "🔄 Publishing from Sanity..."
echo ""

if [ -z "$SLUG" ]; then
  echo "📦 Syncing all articles from Sanity..."
  node scripts/sanity-migration/syncFromSanity.js
else
  echo "📝 Syncing single article: $SLUG"
  node scripts/sanity-migration/syncFromSanity.js --slug="$SLUG"
fi

echo ""
echo "🔧 Updating blog metadata and routing..."
npx tsx scripts/update-post-metadata.ts

echo ""
echo "✅ Blog published successfully!"

if [ -n "$SLUG" ]; then
  echo "📍 Article URL: http://localhost:3000/blog/$SLUG"
fi

echo ""
echo "💡 Tip: If you see stale content, restart the dev server with 'npm run dev'"

echo "Sanity publish completed. Refreshing Next.js blog manifest..."
node scripts/generate-blog-manifest.mjs || {
  echo "Warning: blog manifest generation failed; articles may not appear until fixed." >&2
}
