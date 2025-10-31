# Storybook Deployment Guide

This document outlines how to deploy Storybook to `digitaltableteur.com/storybook`.

## 🎯 Current Setup

Your Storybook will be available at:
- **Production**: `https://digitaltableteur.com/storybook`
- **Development**: `http://localhost:6006`

## 🚀 Deployment Methods

### Method 1: Automatic GitHub Actions (Recommended)

The deployment is now **fully automated** via GitHub Actions:

1. **What happens automatically:**
   - When you push to `main` branch
   - GitHub Actions builds your main site
   - GitHub Actions builds Storybook
   - Both are combined and deployed to GitHub Pages
   - Storybook is placed in `/storybook` subdirectory

2. **No manual steps required** - just push your code!

### Method 2: Manual Local Deployment

If you need to deploy manually:

```bash
npm run deploy:with-storybook
```

This script:
- Builds the main site
- Builds Storybook
- Combines them into the correct structure
- Deploys to GitHub Pages

## 🔧 Configuration Details

### Storybook Configuration

The `.storybook/main.ts` has been updated to:
- Set the correct base path for production (`/storybook/`)
- Configure asset loading for subdirectory deployment
- Maintain compatibility with local development

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` workflow:
- Builds both main site and Storybook
- Places Storybook in `/storybook` subdirectory
- Maintains your existing CNAME configuration
- Deploys to `gh-pages` branch

## 🌐 URLs

After deployment, your sites will be available at:

- **Main Site**: `https://digitaltableteur.com`
- **Storybook**: `https://digitaltableteur.com/storybook`

## 🔍 Troubleshooting

### If Storybook assets don't load:

1. Check browser console for 404 errors
2. Verify the base path is correctly set in production
3. Ensure all static assets are properly referenced

### If deployment fails:

1. Check GitHub Actions logs in your repository
2. Verify all dependencies are properly installed
3. Ensure the build completes successfully locally

### Local Testing

To test the subdirectory setup locally:

```bash
# Build both sites
npm run build
npm run build-storybook

# Serve with a local server that supports subdirectories
npx http-server dist -p 8080

# Then visit:
# http://localhost:8080 (main site)
# http://localhost:8080/storybook (storybook)
```

## 📝 Alternative Deployment Options

If you need different hosting setups:

### Option A: Separate Subdomain
- Deploy Storybook to `storybook.digitaltableteur.com`
- Requires DNS configuration
- More complex but fully isolated

### Option B: Vercel/Netlify Integration
- Use platform-specific deployment for both sites
- Better performance and CDN integration
- Requires platform-specific configuration

### Option C: Docker Container
- Deploy both as separate containers
- Use reverse proxy (nginx) to serve under paths
- More complex infrastructure setup

## 🎨 Customization

### Storybook Branding

Add your branding in `.storybook/manager-head.html`:

```html
<link rel="icon" type="image/png" href="../public/favicon.ico">
<title>Digitaltableteur - Storybook</title>
```

### Storybook Theme

Customize the theme in `.storybook/manager.js`:

```javascript
import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';

addons.setConfig({
  theme: {
    ...themes.normal,
    brandTitle: 'Digitaltableteur Components',
    brandUrl: 'https://digitaltableteur.com',
  },
});
```