# Cache Busting Guide for Production

## 🚀 **Available Cache Busting Methods**

### **1. Automatic GitHub Actions Deployment (Recommended)**
Every push to `main` branch automatically:
- ✅ Builds with unique file hashes
- ✅ Runs cache busting script
- ✅ Deploys with `force_orphan: true` (clears git history)
- ✅ Adds version metadata

### **2. Manual Cache Bust Commands**

#### **Quick Cache Bust**
```bash
npm run cache-bust
```
Adds version timestamp, meta tags, and .nojekyll file.

#### **Emergency Deployment**
```bash
npm run deploy:emergency
```
Full rebuild + cache bust + immediate deployment.

#### **Standard Deployment with Storybook**
```bash
npm run deploy:with-storybook
```
Builds both main site and Storybook, then deploys.

### **3. Vite Configuration Enhancements**

The `vite.config.ts` now includes:
```typescript
build: {
  rollupOptions: {
    output: {
      // Aggressive cache busting file naming
      chunkFileNames: "assets/[name]-[hash].js",
      entryFileNames: "assets/[name]-[hash].js", 
      assetFileNames: "assets/[name]-[hash].[ext]",
    },
  },
}
```

## 📊 **Cache Busting Features**

### **File Hash Changes**
Every build generates new hashes:
- ❌ Old: `Contact-YwjJxXMq.js`
- ✅ New: `Contact-DKNb5gHd.js`

### **Version Tracking**
- `dist/version.json` - Build metadata with timestamp and commit hash
- `<meta name="build-version">` - Added to index.html
- `.nojekyll` - Prevents GitHub Pages Jekyll processing

### **GitHub Pages Optimization**
- `force_orphan: true` - Clears deployment history
- Fresh git commits for each deployment
- No incremental updates that might cache

## 🎯 **How to Trigger Cache Bust**

### **For Immediate Effect:**
1. **Push to main branch** (automatic via GitHub Actions)
2. **Run emergency deploy** (`npm run deploy:emergency`)
3. **Manual deployment** (`npm run deploy:with-storybook`)

### **For Users Experiencing Cache Issues:**
1. **Hard refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear browser cache**: Chrome DevTools > Network tab > "Disable cache"
3. **Incognito mode**: Always loads fresh content

## 🔍 **Verification Methods**

### **Check if Cache Bust Worked:**
1. **Version endpoint**: Visit `https://digitaltableteur.com/version.json`
2. **File hashes**: New deployment = different file names in Network tab
3. **Build timestamp**: Check meta tag in page source

### **Debug Cache Issues:**
```javascript
// Run in browser console
console.log("Build version:", document.querySelector('meta[name="build-version"]')?.content);
fetch('/version.json').then(r => r.json()).then(console.log);
```

## ⚡ **Emergency Cache Clear Process**

If users are stuck with old cached content:

1. **Deploy immediately**:
   ```bash
   npm run deploy:emergency
   ```

2. **Notify users** to hard refresh:
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`
   - Mobile: Clear browser cache

3. **Verify deployment**:
   ```bash
   curl -s https://digitaltableteur.com/version.json | jq .
   ```

## 📁 **Files Modified for Cache Busting**

- ✅ `.github/workflows/deploy.yml` - Added cache busting step
- ✅ `vite.config.ts` - Enhanced build configuration  
- ✅ `scripts/cache-bust.sh` - Cache busting script
- ✅ `scripts/emergency-deploy.sh` - Emergency deployment
- ✅ `package.json` - Added cache busting commands

## 🌐 **Production URLs**

- **Main Site**: `https://digitaltableteur.com`
- **Storybook**: `https://digitaltableteur.com/storybook`
- **Version Info**: `https://digitaltableteur.com/version.json`

## ⚠️ **Important Notes**

- Cache busting is **automatic** on every main branch push
- File hashes change with **every build** (even identical code)
- GitHub Pages deployment includes `force_orphan: true` for maximum cache clearing
- Users may need to **hard refresh** for immediate effect