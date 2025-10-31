#!/bin/bash

# Emergency cache bust - run this to force immediate cache clearing
echo "🚨 Emergency Cache Bust Initiated"

# Build with cache busting
npm run build

# Run cache busting script
./scripts/cache-bust.sh

# Deploy immediately
npm run deploy:with-storybook

echo "🎯 Emergency deployment complete!"
echo "💡 Users should hard refresh (Cmd+Shift+R / Ctrl+Shift+R) to see changes immediately"