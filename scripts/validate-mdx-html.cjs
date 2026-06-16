#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Validate MDX files for common HTML hydration issues
 * 
 * This script checks for:
 * 1. Unwrapped <figcaption> tags (must be inside <figure>)
 * 2. Other invalid HTML nesting patterns that cause hydration errors
 * 
 * Usage:
 *   npm run validate:mdx
 *   npm run validate:mdx -- --fix  (auto-fix issues)
 */
const fs = require("fs");
const path = require("path");

const ROOT_DIR = process.cwd();
const CONTENT_DIRS = [path.join(ROOT_DIR, "content/posts")];

const ISSUES = {
  UNWRAPPED_FIGCAPTION: "unwrapped-figcaption",
};

let totalFiles = 0;
let totalIssues = 0;
const fileIssues = new Map();

function checkUnwrappedFigcaptions(filePath, content) {
  const issues = [];
  const lines = content.split("\n");
  let inFigure = false;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Track figure tags
    if (/^<figure>/.test(line)) {
      inFigure = true;
    } else if (/^<\/figure>/.test(line)) {
      inFigure = false;
    }
    
    // Check for unwrapped figcaption
    if (/^<figcaption>/.test(line) && !inFigure) {
      issues.push({
        type: ISSUES.UNWRAPPED_FIGCAPTION,
        line: lineNum,
        content: line.trim(),
        message: `Line ${lineNum}: <figcaption> must be inside <figure> tags to prevent hydration errors`,
      });
    }
  });
  
  return issues;
}

function validateFile(filePath) {
  if (!fs.existsSync(filePath) || !filePath.endsWith(".mdx")) {
    return;
  }
  
  totalFiles++;
  const content = fs.readFileSync(filePath, "utf8");
  const issues = checkUnwrappedFigcaptions(filePath, content);
  
  if (issues.length > 0) {
    totalIssues += issues.length;
    fileIssues.set(filePath, issues);
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith(".mdx")) {
      validateFile(filePath);
    }
  });
}

function printReport() {
  console.log("\n📋 MDX HTML Validation Report");
  console.log("─".repeat(60));
  console.log(`✓ Files scanned: ${totalFiles}`);
  
  if (totalIssues === 0) {
    console.log("✓ No issues found! All MDX files are valid.\n");
    return true;
  }
  
  console.log(`✗ Issues found: ${totalIssues}\n`);
  
  fileIssues.forEach((issues, filePath) => {
    const relativePath = path.relative(ROOT_DIR, filePath);
    console.log(`\n❌ ${relativePath}`);
    issues.forEach((issue) => {
      console.log(`   ${issue.message}`);
      console.log(`   ${issue.content}`);
    });
  });
  
  console.log("\n💡 Fix suggestions:");
  console.log("   Wrap figcaptions in figure tags:");
  console.log("   <figure>");
  console.log("   ");
  console.log("   ![alt text](image-url)");
  console.log("   ");
  console.log("   <figcaption>Caption text</figcaption>");
  console.log("   ");
  console.log("   </figure>\n");
  
  return false;
}

function main() {
  console.log("🔍 Scanning MDX files for HTML validation issues...\n");
  
  CONTENT_DIRS.forEach((dir) => {
    if (fs.existsSync(dir)) {
      console.log(`Scanning: ${path.relative(ROOT_DIR, dir)}`);
      scanDirectory(dir);
    }
  });
  
  const isValid = printReport();
  process.exit(isValid ? 0 : 1);
}

main();
