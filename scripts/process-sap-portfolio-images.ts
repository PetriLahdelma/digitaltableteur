/**
 * SAP Build Apps Portfolio Image Processing Script
 *
 * Converts high-resolution source images to web-optimized WebP format.
 * Target dimensions:
 * - GRID: 738x506px (for GridBlock components)
 * - HERO: 1200x600px (for hero/full-width images)
 * - SQUARE: 500x500px (for icons/avatars)
 *
 * Usage: npx tsx scripts/process-sap-portfolio-images.ts
 */

import * as sharpModule from "sharp";
import * as fs from "node:fs";
import * as path from "node:path";

// Handle both CommonJS and ESM imports
const sharp =
  (sharpModule as unknown as { default: typeof sharpModule }).default ||
  sharpModule;

// Image dimension presets
const DIMENSIONS = {
  GRID: { width: 738, height: 506 },
  HERO: { width: 1200, height: 600 },
  SQUARE: { width: 500, height: 500 },
} as const;

type DimensionType = keyof typeof DIMENSIONS;

// Source directories
const SOURCE_DIRS = {
  assets:
    "/Users/petrilahdelma/Documents/_WORK/Portfolio content/Projects/SAP-Build-Apps-Design-System/assets",
  documentation:
    "/Users/petrilahdelma/Documents/_WORK/Portfolio content/Projects/SAP-Build-Apps-Design-System/assets/documentation",
  existing:
    "/Users/petrilahdelma/SAPDevelop/digitaltableteur/public/images/portfolio/sap-build-apps",
};

// Output directory
const OUTPUT_DIR =
  "/Users/petrilahdelma/SAPDevelop/digitaltableteur/public/images/portfolio/sap-build-apps";

// Image mappings: source filename -> { output name, dimension type }
interface ImageMapping {
  source: string;
  output: string;
  dimension: DimensionType;
  sourceDir: keyof typeof SOURCE_DIRS;
}

const IMAGE_MAPPINGS: ImageMapping[] = [
  // New images from documentation folder (REQUIREMENTS IMG-04 through IMG-07)
  {
    source: "Typography AG New (APPGYVER-1188).png",
    output: "typography.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Button (APPGYVER-1132).png",
    output: "button-construction.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Table (APPGYVER-1145).png",
    output: "table-component.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Datavisualization (APPGYVER-1141).png",
    output: "data-visualization.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  // Additional documentation images
  {
    source: "Card.png",
    output: "card-component.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Checkbox (APPGYVER-1130).png",
    output: "checkbox-component.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Dialog (APPGYVER-1133).png",
    output: "dialog-component.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Text field documentation.png",
    output: "text-field-component.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Toast_documentation.png",
    output: "toast-component.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  {
    source: "Toggle (APPGYVER-1123).png",
    output: "toggle-component.webp",
    dimension: "GRID",
    sourceDir: "documentation",
  },
  // Assets folder images
  {
    source: "background-DWP70ox1.png",
    output: "hero-background.webp",
    dimension: "HERO",
    sourceDir: "assets",
  },
  {
    source: "design-system-team.jpg",
    output: "design-system-team.webp",
    dimension: "GRID",
    sourceDir: "assets",
  },
];

// Existing PNGs to convert (auto-detected from output dir)
async function getExistingPngsToConvert(): Promise<ImageMapping[]> {
  const files = await fs.promises.readdir(OUTPUT_DIR);
  const pngFiles = files.filter(
    (f) => f.endsWith(".png") && !f.startsWith(".")
  );

  return pngFiles.map((pngFile) => {
    // Convert filename to kebab-case WebP
    const baseName = path.basename(pngFile, ".png");
    const kebabName = baseName
      .replace(/[_\s]+/g, "-")
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "")
      .replace(/-+/g, "-");

    return {
      source: pngFile,
      output: `${kebabName}.webp`,
      dimension: "GRID" as DimensionType,
      sourceDir: "existing" as keyof typeof SOURCE_DIRS,
    };
  });
}

async function processImage(mapping: ImageMapping): Promise<void> {
  const sourceDir = SOURCE_DIRS[mapping.sourceDir];
  const sourcePath = path.join(sourceDir, mapping.source);
  const outputPath = path.join(OUTPUT_DIR, mapping.output);

  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.log(`  SKIP: Source not found: ${mapping.source}`);
    return;
  }

  // Skip if not an image file
  const ext = path.extname(mapping.source).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    console.log(`  SKIP: Not an image file: ${mapping.source}`);
    return;
  }

  const { width, height } = DIMENSIONS[mapping.dimension];

  try {
    // Get source file stats
    const sourceStats = await fs.promises.stat(sourcePath);
    const sourceSizeKB = Math.round(sourceStats.size / 1024);

    // Process the image
    await sharp(sourcePath)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    // Get output file stats
    const outputStats = await fs.promises.stat(outputPath);
    const outputSizeKB = Math.round(outputStats.size / 1024);
    const savings = Math.round((1 - outputStats.size / sourceStats.size) * 100);

    console.log(
      `  OK: ${mapping.source} -> ${mapping.output} (${sourceSizeKB}KB -> ${outputSizeKB}KB, ${savings}% smaller)`
    );
  } catch (error) {
    console.error(`  ERROR: Failed to process ${mapping.source}:`, error);
  }
}

async function main(): Promise<void> {
  console.log("SAP Build Apps Portfolio Image Processing\n");
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log("Created output directory\n");
  }

  // Process mapped images (new images from source folders)
  console.log("Processing new images from source folders:");
  for (const mapping of IMAGE_MAPPINGS) {
    await processImage(mapping);
  }

  // Process existing PNGs in output directory
  console.log("\nConverting existing PNGs to WebP:");
  const existingMappings = await getExistingPngsToConvert();
  for (const mapping of existingMappings) {
    await processImage(mapping);
  }

  console.log("\nImage processing complete!");
}

main().catch(console.error);
