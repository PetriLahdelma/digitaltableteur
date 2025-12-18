#!/usr/bin/env node
/**
 * Figma Selection to React Component Generator
 *
 * Usage:
 *   1. Get selection JSON from Figma MCP (save to /tmp/figma-selection.json)
 *   2. Run: node scripts/figma-to-component.mjs /tmp/figma-selection.json HelsinkiDesignSystemPage
 */

import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(
    "Usage: node figma-to-component.mjs <selection-json-path> <target-component-name>",
  );
  process.exit(1);
}

const [jsonPath, targetComponent] = args;

// Read selection JSON
let selectionData;
try {
  const raw = fs.readFileSync(jsonPath, "utf8");
  selectionData = JSON.parse(raw);
} catch (err) {
  console.error(`Failed to read/parse ${jsonPath}:`, err.message);
  process.exit(1);
}

console.log("✓ Loaded Figma selection JSON");
console.log(`  Target: ${targetComponent}`);

// Parse node tree
function parseNode(node, depth = 0) {
  const indent = "  ".repeat(depth);
  console.log(`${indent}- ${node.type} "${node.name}" (${node.id})`);

  const parsed = {
    id: node.id,
    name: node.name,
    type: node.type,
    geometry: {
      x: node.absoluteBoundingBox?.x || node.relativeTransform?.[0]?.[2] || 0,
      y: node.absoluteBoundingBox?.y || node.relativeTransform?.[1]?.[2] || 0,
      width: node.absoluteBoundingBox?.width || node.size?.x || 0,
      height: node.absoluteBoundingBox?.height || node.size?.y || 0,
    },
    fills: node.fills || [],
    strokes: node.strokes || [],
    cornerRadius: node.cornerRadius,
    children: [],
  };

  // Text content
  if (node.type === "TEXT") {
    parsed.textContent = node.characters || "";
    parsed.textStyle = {
      fontFamily: node.style?.fontFamily,
      fontSize: node.style?.fontSize,
      fontWeight: node.style?.fontWeight,
      lineHeight: node.style?.lineHeightPx,
      letterSpacing: node.style?.letterSpacing,
    };
  }

  // Auto-layout
  if (node.layoutMode) {
    parsed.autoLayout = {
      direction: node.layoutMode, // HORIZONTAL | VERTICAL
      spacing: node.itemSpacing || 0,
      padding: {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0,
      },
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      counterAxisAlignItems: node.counterAxisAlignItems,
    };
  }

  // Constraints
  if (node.constraints) {
    parsed.constraints = node.constraints;
  }

  // Recurse children
  if (node.children && node.children.length > 0) {
    parsed.children = node.children.map((child) => parseNode(child, depth + 1));
  }

  return parsed;
}

// Extract root node
const rootNode = selectionData.document || selectionData.node || selectionData;
const parsedTree = parseNode(rootNode);

console.log("\n✓ Parsed node tree");

// Component mapping heuristics
function mapToComponent(node) {
  const nameLower = node.name.toLowerCase();

  // Title/Heading detection
  if (node.type === "TEXT") {
    if (
      nameLower.includes("title") ||
      nameLower.includes("heading") ||
      nameLower.includes("h1") ||
      nameLower.includes("h2")
    ) {
      return {
        component: "Title",
        import: "@dt/Title",
        props: {
          level: nameLower.includes("h1")
            ? 1
            : nameLower.includes("h2")
              ? 2
              : 3,
        },
      };
    }
    if (
      nameLower.includes("body") ||
      nameLower.includes("text") ||
      nameLower.includes("paragraph")
    ) {
      return { component: "Text", import: "@dt/Text", props: { size: "M" } };
    }
    if (nameLower.includes("label") || nameLower.includes("caption")) {
      return { component: "Text", import: "@dt/Text", props: { size: "S" } };
    }
    return { component: "Text", import: "@dt/Text", props: { size: "M" } };
  }

  // Button detection
  if (nameLower.includes("button") || nameLower.includes("btn")) {
    return { component: "Button", import: "@dt/Button", props: {} };
  }

  // Card detection
  if (nameLower.includes("card")) {
    return { component: "Card", import: "@dt/Card", props: {} };
  }

  // Badge detection
  if (nameLower.includes("badge") || nameLower.includes("tag")) {
    return { component: "Badge", import: "@dt/Badge", props: {} };
  }

  // FlexBox for layout containers with auto-layout
  if (node.autoLayout) {
    return {
      component: "FlexBox",
      import: "@dt/FlexBox",
      props: {
        direction:
          node.autoLayout.direction === "HORIZONTAL" ? "row" : "column",
        gap: node.autoLayout.spacing,
      },
    };
  }

  // Default: div
  return { component: "div", import: null, props: {} };
}

// Generate React JSX
function generateJSX(node, depth = 0) {
  const indent = "  ".repeat(depth + 1);
  const mapping = mapToComponent(node);

  let jsx = `${indent}<${mapping.component}`;

  // Add props
  if (Object.keys(mapping.props).length > 0) {
    for (const [key, value] of Object.entries(mapping.props)) {
      if (typeof value === "string") {
        jsx += ` ${key}="${value}"`;
      } else if (typeof value === "number") {
        jsx += ` ${key}={${value}}`;
      } else {
        jsx += ` ${key}={${JSON.stringify(value)}}`;
      }
    }
  }

  // Add className
  const className = node.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  jsx += ` className={styles.${className}}`;

  if (node.type === "TEXT" && node.textContent) {
    jsx += `>\n${indent}  ${node.textContent}\n${indent}</${mapping.component}>`;
  } else if (node.children && node.children.length > 0) {
    jsx += `>\n`;
    node.children.forEach((child) => {
      jsx += generateJSX(child, depth + 1) + "\n";
    });
    jsx += `${indent}</${mapping.component}>`;
  } else {
    jsx += ` />`;
  }

  return jsx;
}

// Generate CSS Module
function generateCSS(node, accumulated = []) {
  const className = node.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  let css = `.${className} {\n`;

  // Layout
  if (node.geometry.width) css += `  width: ${node.geometry.width}px;\n`;
  if (node.geometry.height) css += `  height: ${node.geometry.height}px;\n`;

  // Auto-layout
  if (node.autoLayout) {
    css += `  display: flex;\n`;
    css += `  flex-direction: ${node.autoLayout.direction === "HORIZONTAL" ? "row" : "column"};\n`;
    if (node.autoLayout.spacing)
      css += `  gap: ${node.autoLayout.spacing}px;\n`;
    const p = node.autoLayout.padding;
    if (p.top || p.right || p.bottom || p.left) {
      css += `  padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;\n`;
    }
  }

  // Typography
  if (node.textStyle) {
    if (node.textStyle.fontSize)
      css += `  font-size: ${node.textStyle.fontSize}px;\n`;
    if (node.textStyle.fontWeight)
      css += `  font-weight: ${node.textStyle.fontWeight};\n`;
    if (node.textStyle.lineHeight)
      css += `  line-height: ${node.textStyle.lineHeight}px;\n`;
  }

  // Fills
  if (node.fills && node.fills.length > 0) {
    const solidFill = node.fills.find(
      (f) => f.type === "SOLID" && f.visible !== false,
    );
    if (solidFill && solidFill.color) {
      const r = Math.round(solidFill.color.r * 255);
      const g = Math.round(solidFill.color.g * 255);
      const b = Math.round(solidFill.color.b * 255);
      const a = solidFill.opacity || 1;
      css += `  background-color: rgba(${r}, ${g}, ${b}, ${a});\n`;
    }
  }

  // Corner radius
  if (node.cornerRadius) {
    css += `  border-radius: ${node.cornerRadius}px;\n`;
  }

  css += `}\n`;
  accumulated.push(css);

  // Recurse
  if (node.children) {
    node.children.forEach((child) => generateCSS(child, accumulated));
  }

  return accumulated;
}

const jsxOutput = generateJSX(parsedTree);
const cssOutput = generateCSS(parsedTree).join("\n");

// Collect unique imports
const imports = new Set();
function collectImports(node) {
  const mapping = mapToComponent(node);
  if (mapping.import)
    imports.add(`import ${mapping.component} from "${mapping.import}";`);
  if (node.children) node.children.forEach(collectImports);
}
collectImports(parsedTree);

const componentCode = `"use client";

import React from "react";
${Array.from(imports).join("\n")}
import styles from "./${targetComponent}.module.css";

export function ${targetComponent}Section() {
  return (
    <section className={styles.figmaSection}>
${jsxOutput}
    </section>
  );
}
`;

console.log("\n✓ Generated component code");
console.log("\n--- COMPONENT TSX ---\n");
console.log(componentCode);

console.log("\n--- CSS MODULE ---\n");
console.log(cssOutput);

console.log(
  "\n✓ Done. Copy the code above into your files, or redirect output to files.",
);
console.log(
  "  Example: node scripts/figma-to-component.mjs /tmp/figma-selection.json HelsinkiDesignSystemPage > /tmp/output.txt",
);
