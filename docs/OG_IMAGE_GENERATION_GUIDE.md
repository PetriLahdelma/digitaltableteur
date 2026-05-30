# SEO Open Graph Image Generation Guide

## 📐 Image Specifications

Create optimized social sharing images for each main page:

### Technical Requirements

- **Dimensions**: 1200 x 630 pixels (1.91:1 aspect ratio)
- **Format**: WebP with PNG fallback
- **File Size**: < 1MB (ideally < 300KB)
- **Color Space**: sRGB
- **Quality**: 85-90% for WebP, 80% for PNG

### Design Guidelines

1. **Safe Zone**: Keep important content within **1080 x 566px** center area (60px margin on all sides)
2. **Text**: High contrast, minimum 36px font size, readable at thumbnail size
3. **Branding**: Include Digitaltableteur logo in consistent position
4. **Visual Hierarchy**: Page title prominent, supporting text secondary
5. **Background**: Avoid pure white/black, use brand colors or gradients

---

## 🎨 Required Images

Create these images in `/public/og/`:

### 1. Home Page (`og-home.webp` + `og-home.png`)

**Content:**

- Large title: "Design Systems & AI-Powered DesignOps"
- Subtitle: "Professional design operations, component libraries, and intelligent automation"
- DT logo in top-left or bottom-right
- Background: Brand gradient or abstract design system visual

**Usage:** `app/page.tsx` → Update metadata images array

---

### 2. About Page (`og-about.webp` + `og-about.png`)

**Content:**

- Title: "About Petri Lahdelma"
- Subtitle: "Design Systems Specialist & DesignOps Engineer"
- Optional: Professional photo or avatar
- Skills icons: React, TypeScript, Figma, AI
- Background: Professional, clean design

**Usage:** `app/about/page.tsx` → Update generateMetadata images

---

### 3. Blog Index (`og-blog.webp` + `og-blog.png`)

**Content:**

- Title: "Design Systems Blog"
- Subtitle: "Articles on component architecture, AI workflows, and modern DesignOps"
- Visual: Abstract blog/article icons or grid pattern
- Recent article count or featured topics

**Usage:** `app/blog/page.tsx` → Update metadata images

---

### 4. Work Portfolio (`og-work.webp` + `og-work.png`)

**Content:**

- Title: "Portfolio & Case Studies"
- Subtitle: "Scalable design systems and AI-powered automation projects"
- Visual: Collage of project thumbnails or abstract grid
- Project count badge

**Usage:** `app/work/page.tsx` → Update metadata images

---

### 5. Default/Fallback (`og-default.webp` + `og-default.png`)

**Content:**

- Title: "Digitaltableteur"
- Tagline: "Design Systems & AI-Powered DesignOps"
- Logo prominent and centered
- Clean, brand-focused design

**Usage:** Fallback for pages without custom OG images

---

## 🛠️ Generation Methods

### Option 0: Codex `image_gen` (ChatGPT/Codex login)

For AI-generated raster heroes and OG art, use Codex’s built-in image tool or the fallback Images API script. Auth, feature flags, and Cursor delegation are documented in **[`CODEX_IMAGE_GENERATION.md`](CODEX_IMAGE_GENERATION.md)** (this repo only).

- **Default:** `codex` + `$imagegen` → no extra API key if built-in tool is enabled.
- **Fallback:** `~/.codex/skills/.system/imagegen/scripts/image_gen.py` → requires `OPENAI_API_KEY` in `.env.local`.

### Option 1: Design Tool (Figma/Sketch/Adobe XD)

1. Create 1200x630 artboard
2. Design using brand guidelines
3. Export as WebP (ImageOptim/Squoosh) + PNG fallback
4. Place in `/public/og/`

### Option 2: Code Generation (Canvas/Sharp)

Create `/scripts/generate-og-images.js`:

```javascript
const sharp = require("sharp");
const { createCanvas, loadImage } = require("canvas");

async function generateOGImage(options) {
  const { title, subtitle, output } = options;
  const width = 1200;
  const height = 630;

  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1e3a8a"); // Brand blue
  gradient.addColorStop(1, "#7c3aed"); // Brand purple
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 72px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, height / 2 - 40);

  // Subtitle text
  ctx.font = "36px Inter, sans-serif";
  ctx.fillText(subtitle, width / 2, height / 2 + 40);

  // Save as PNG
  const buffer = canvas.toBuffer("image/png");
  await sharp(buffer)
    .webp({ quality: 90 })
    .toFile(output.replace(".png", ".webp"));
  await sharp(buffer).png({ quality: 80 }).toFile(output);
}

// Generate all images
generateOGImage({
  title: "Design Systems & AI-Powered DesignOps",
  subtitle: "Professional design operations and intelligent automation",
  output: "public/og/og-home.png",
});
// ... repeat for other pages
```

### Option 3: Online Tools

- [Canva](https://www.canva.com/) - Templates with 1200x630 preset
- [Figma Community](https://www.figma.com/community) - Search "Open Graph template"
- [OG Image Playground](https://og-playground.vercel.app/) - Code-based generation

---

## 📝 Implementation Checklist

After generating images, update these files:

### ✅ Root Layout (`app/layout.tsx`)

```tsx
openGraph: {
  images: [
    {
      url: '/og/og-home.webp',
      width: 1200,
      height: 630,
      alt: 'Digitaltableteur - Design Systems & AI-Powered DesignOps',
    },
  ],
}
```

### ✅ Page-Specific Metadata

Update each page's `generateMetadata()` or `metadata` export with:

```tsx
images: [
  {
    url: "/og/og-[page].webp",
    width: 1200,
    height: 630,
    alt: "Page-specific description",
  },
];
```

### ✅ Testing

1. **Local Preview**: View at `http://localhost:3000/og/og-home.webp`
2. **Social Debuggers**:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
3. **Lighthouse**: Run SEO audit, verify OG tags present
4. **Schema Validator**: Check [validator.schema.org](https://validator.schema.org/)

---

## 🎯 Priority Order

1. **Home page** (`og-home.webp`) - Highest traffic
2. **About page** (`og-about.webp`) - Personal branding
3. **Default fallback** (`og-default.webp`) - Catch-all
4. **Blog index** (`og-blog.webp`) - Content discovery
5. **Work portfolio** (`og-work.webp`) - Project showcase

Individual blog posts can use featured images or fall back to `og-blog.webp`.

---

## 📊 Expected Impact

- **Click-Through Rate**: +15-30% from social shares
- **Brand Recognition**: Consistent visual identity across platforms
- **Professionalism**: Properly formatted previews vs generic fallbacks
- **Social Proof**: Rich previews encourage sharing and engagement

---

## 🔗 Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Image Optimization Guide](https://web.dev/image-optimization/)
- [Squoosh](https://squoosh.app/) - Image compression tool
- [ImageOptim](https://imageoptim.com/) - Mac image optimizer

---

**Note:** Until custom OG images are created, the current `logo512.png` will continue to work but with suboptimal aspect ratio and lack of context. This is acceptable as a temporary solution but should be addressed for production launch.
