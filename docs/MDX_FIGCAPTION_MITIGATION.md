# MDX HTML Hydration Error Prevention

## Problem

When importing content from Sanity CMS, images with captions were generating unwrapped `<figcaption>` tags in MDX files. This caused React hydration errors because:

1. MDX automatically wraps content in `<p>` tags
2. HTML5 spec prohibits `<figcaption>` as a descendant of `<p>`
3. This creates a mismatch between server-rendered and client-rendered HTML

**Error Message:**

```
In HTML, <figcaption> cannot be a descendant of <p>. This will cause a hydration error.
```

## Solution

### 1. Fixed Sanity Sync Script

Updated `scripts/sanity-migration/syncFromSanity.js` to automatically wrap images with captions in proper `<figure>` tags:

**Before:**

```javascript
const caption = node.caption
  ? `\n<figcaption>${node.caption}</figcaption>`
  : "";
return `![${alt}](${url})${caption}`;
```

**After:**

```javascript
if (node.caption) {
  return `<figure>\n\n![${alt}](${url})\n\n<figcaption>${node.caption}</figcaption>\n\n</figure>`;
}
return `![${alt}](${url})`;
```

**Key Changes:**

- Wraps image and figcaption in `<figure>` element
- Adds blank lines before/after image to prevent MDX from wrapping in `<p>`
- Only applies wrapper when caption exists

### 2. Created Validation Script

Added `scripts/validate-mdx-html.cjs` to automatically detect unwrapped figcaptions:

**Usage:**

```bash
npm run validate:mdx
```

**What it checks:**

- ✅ All `<figcaption>` tags are inside `<figure>` elements
- ✅ Scans `content/posts/`
- ✅ Exits with error code if issues found (CI-ready)

**Output:**

```
📋 MDX HTML Validation Report
────────────────────────────────────────────────────────────
✓ Files scanned: 21
✓ No issues found! All MDX files are valid.
```

### 3. Proper MDX Structure

When manually creating MDX files with images and captions, always use:

```mdx
<figure>

![Alt text description](image-url)

<figcaption>Your caption text here</figcaption>

</figure>
```

**Important:** The blank lines before and after the image are required to prevent MDX from wrapping the content in `<p>` tags.

## Integration Points

### Pre-Commit Hook (Recommended)

Add to `.husky/pre-commit` or similar:

```bash
npm run validate:mdx
```

### CI/CD Pipeline

Add to GitHub Actions workflow:

```yaml
- name: Validate MDX HTML
  run: npm run validate:mdx
```

### Workflow Integration

1. Edit content in Sanity CMS
2. Run `npm run sanity:sync-from-remote` - automatically generates proper structure
3. Run `npm run validate:mdx` - verify no issues
4. Commit changes

## Manual Fixes

If you encounter unwrapped figcaptions in existing files:

1. Find them:

```bash
grep -n "^<figcaption>" content/posts/*.mdx
```

2. Fix pattern:

```mdx
# Before (causes hydration error)

![Alt](url)

<figcaption>Caption</figcaption>

# After (correct)

<figure>

![Alt](url)

<figcaption>Caption</figcaption>

</figure>
```

## Related Issues

- Fixed in: `content/posts/thoughts-on-future-branding.mdx`
- Date: 2025-11-27

## Technical Details

- **Root Cause:** `@sanity/block-content-to-markdown` doesn't understand HTML5 semantic requirements
- **HTML5 Spec:** `<figcaption>` must be first or last child of `<figure>`
- **MDX Behavior:** Automatically wraps content in `<p>` unless broken by block-level HTML elements
- **React Hydration:** Server and client HTML must match exactly; spec violations cause errors

## Prevention Checklist

- [x] Sanity sync script generates proper structure
- [x] Validation script detects issues
- [x] Documentation added
- [x] NPM script added (`validate:mdx`)
- [ ] Pre-commit hook (optional)
- [ ] CI/CD integration (optional)

## See Also

- [MDX Documentation](https://mdxjs.com/docs/troubleshooting-mdx/#html-elements-in-mdx-arent-hydrated)
- [HTML5 Figure Element Spec](https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element)
- [React Hydration Errors](https://react.dev/link/hydration-mismatch)
