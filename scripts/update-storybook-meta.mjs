#!/usr/bin/env node
/**
 * Script to programmatically update Storybook story files:
 * 1. Add `tags: ["autodocs"]` to meta objects that don't have it
 * 2. Add `parameters: { docs: { disable: true } }` to all Z Compliance stories
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

// Find all story files
const storyFiles = execSync(
  'find /Users/petrilahdelma/SAPDevelop/digitaltableteur -name "*.stories.tsx" -type f | grep -E "(shared|nextjs-app)"',
  { encoding: "utf-8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

console.log(`Found ${storyFiles.length} story files\n`);

let filesUpdated = 0;
let filesSkipped = 0;
let complianceStoriesUpdated = 0;

for (const filePath of storyFiles) {
  try {
    let content = readFileSync(filePath, "utf-8");
    let modified = false;

    // Check if file already has tags: ["autodocs"]
    const hasAutodocs = /tags:\s*\[["']autodocs["']\]/m.test(content);

    if (!hasAutodocs) {
      // Pattern 1: Add tags after title in meta object
      // Matches: const meta: Meta<...> = {
      //   title: "...",
      //   component: ...,
      // Looking for the line after component or title
      const metaPattern =
        /(const\s+meta:\s*Meta<[^>]+>\s*=\s*\{[^}]*?component:\s*[^,\n]+,?)(\s*\n)/;

      if (metaPattern.test(content)) {
        content = content.replace(metaPattern, '$1\n  tags: ["autodocs"],$2');
        modified = true;
      } else {
        // Pattern 2: Try after title if component not found
        const titlePattern =
          /(const\s+meta:\s*Meta<[^>]+>\s*=\s*\{[^}]*?title:\s*["'][^"']+["'],?)(\s*\n)/;
        if (titlePattern.test(content)) {
          content = content.replace(
            titlePattern,
            '$1\n  tags: ["autodocs"],$2',
          );
          modified = true;
        }
      }
    }

    // Find all Z Compliance stories and add parameters
    // Pattern: export const Z_.*: Story = {
    const complianceStoryPattern =
      /export\s+const\s+(Z_\w+):\s*Story\s*=\s*\{([^}]*?)\}/gs;
    const matches = [...content.matchAll(complianceStoryPattern)];

    for (const match of matches) {
      const storyName = match[1];
      const storyBody = match[2];

      // Check if it already has docs: { disable: true }
      if (!/docs:\s*\{\s*disable:\s*true\s*\}/.test(storyBody)) {
        // Check if it has parameters object
        if (/parameters:\s*\{/.test(storyBody)) {
          // Add docs to existing parameters
          const fullMatch = match[0];
          const updatedStory = fullMatch.replace(
            /parameters:\s*\{/,
            "parameters: {\n    docs: { disable: true },",
          );
          content = content.replace(fullMatch, updatedStory);
        } else {
          // Add new parameters object
          const fullMatch = match[0];
          // Find the opening brace and add parameters after it
          const updatedStory = fullMatch.replace(
            /export\s+const\s+Z_\w+:\s*Story\s*=\s*\{/,
            "$&\n  parameters: {\n    docs: { disable: true },\n  },",
          );
          content = content.replace(fullMatch, updatedStory);
        }
        modified = true;
        complianceStoriesUpdated++;
        console.log(`  ✓ Added docs disable to ${storyName}`);
      }
    }

    if (modified) {
      writeFileSync(filePath, content, "utf-8");
      filesUpdated++;
      console.log(`✓ Updated: ${filePath.split("/").pop()}`);
    } else {
      filesSkipped++;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n${"=".repeat(60)}`);
console.log(`Summary:`);
console.log(`  Files updated: ${filesUpdated}`);
console.log(`  Files skipped (no changes needed): ${filesSkipped}`);
console.log(`  Compliance stories updated: ${complianceStoriesUpdated}`);
console.log(`${"=".repeat(60)}\n`);
