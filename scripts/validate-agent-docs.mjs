#!/usr/bin/env node
/**
 * Validates agent instruction structure:
 * - Root CLAUDE.md stays within line budget
 * - AGENT_INDEX.md links resolve
 * - Area AGENTS.md files exist
 * - dt-* skills follow Claude skill conventions (frontmatter, structure)
 */
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLAUDE_MAX_LINES = 220;
const DESCRIPTION_MAX_CHARS = 1024;
const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
let failed = false;

function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}

function pass(msg) {
  console.log(`✓ ${msg}`);
}

function parseFrontmatter(content) {
  if (!content.startsWith("---")) return null;
  const end = content.indexOf("---", 3);
  if (end === -1) return null;
  return {
    frontmatter: content.slice(3, end),
    body: content.slice(end + 3),
  };
}

function yamlField(frontmatter, field) {
  // Block scalar: field: >- or field: |
  const blockRe = new RegExp(`^${field}:\\s*(>-|-|\\|)[-+]?(?:\\s*)\\n`, "m");
  const blockMatch = frontmatter.match(blockRe);
  if (blockMatch) {
    const start = frontmatter.indexOf(blockMatch[0]) + blockMatch[0].length;
    const lines = [];
    for (const line of frontmatter.slice(start).split("\n")) {
      if (/^\s+\S/.test(line)) {
        lines.push(line.trim());
      } else if (lines.length > 0) {
        break;
      }
    }
    return lines.join(" ").trim();
  }

  // Single line: name: value
  const singleRe = new RegExp(`^${field}:\\s*(.+)$`, "m");
  const singleMatch = frontmatter.match(singleRe);
  if (!singleMatch) return null;
  return singleMatch[1].trim().replace(/^["']|["']$/g, "");
}

// --- Root CLAUDE.md line budget ---
const claudePath = join(ROOT, "CLAUDE.md");
if (!existsSync(claudePath)) {
  fail("CLAUDE.md missing");
} else {
  const lines = readFileSync(claudePath, "utf8").split("\n").length;
  if (lines > CLAUDE_MAX_LINES) {
    fail(`CLAUDE.md has ${lines} lines (max ${CLAUDE_MAX_LINES}) — move detail to area AGENTS.md`);
  } else {
    pass(`CLAUDE.md line budget (${lines}/${CLAUDE_MAX_LINES})`);
  }
}

// --- Required area AGENTS.md ---
const requiredAreas = [
  "app/AGENTS.md",
  "app/api/AGENTS.md",
  "nextjs-app/shared/components/AGENTS.md",
  "nextjs-app/shared/patterns/AGENTS.md",
  "providers/AGENTS.md",
  "scripts/AGENTS.md",
  "docs/AGENTS.md",
  "api-legacy-vercel-functions/AGENTS.md",
  "digitaltableteur-blog/AGENTS.md",
];

for (const rel of requiredAreas) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    fail(`Missing area doc: ${rel}`);
  } else {
    pass(`Area doc exists: ${rel}`);
  }
}

// --- AGENT_INDEX.md link resolution ---
const indexPath = join(ROOT, "AGENT_INDEX.md");
if (!existsSync(indexPath)) {
  fail("AGENT_INDEX.md missing");
} else {
  const index = readFileSync(indexPath, "utf8");
  const linkRe = /\]\(([^)]+\.md(?:#[^)]*)?)\)/g;
  let m;
  while ((m = linkRe.exec(index)) !== null) {
    const target = m[1].split("#")[0];
    if (target.startsWith("http")) continue;
    const resolved = join(ROOT, target);
    if (!existsSync(resolved)) {
      fail(`AGENT_INDEX.md broken link: ${target}`);
    }
  }
  pass("AGENT_INDEX.md links resolve");
}

// --- Secret-files hook ---
const hookPath = join(ROOT, ".claude/hooks/block-secret-files.sh");
if (!existsSync(hookPath)) {
  fail("Missing .claude/hooks/block-secret-files.sh");
} else {
  pass("Secret-files PreToolUse hook exists");
}

// --- dt-* skills (Claude skill conventions) ---
const skillsDir = join(ROOT, ".claude/skills");
const dtSkills = [
  "dt-design-system",
  "dt-nextjs-app",
  "dt-api-routes",
  "dt-scripts",
  "dt-sanity-cms",
  "dt-ship-pr",
  "dt-workflow",
];

for (const folder of dtSkills) {
  if (!KEBAB_RE.test(folder)) {
    fail(`Skill folder not kebab-case: ${folder}`);
  }

  const skillPath = join(skillsDir, folder, "SKILL.md");
  if (!existsSync(skillPath)) {
    fail(`Missing skill: .claude/skills/${folder}/SKILL.md`);
    continue;
  }

  const content = readFileSync(skillPath, "utf8");
  const parsed = parseFrontmatter(content);
  if (!parsed) {
    fail(`Skill ${folder}: missing or unclosed YAML frontmatter delimiters`);
    continue;
  }

  const name = yamlField(parsed.frontmatter, "name");
  const description = yamlField(parsed.frontmatter, "description");

  if (!name) {
    fail(`Skill ${folder}: missing 'name' in frontmatter`);
  } else if (name !== folder) {
    fail(`Skill ${folder}: name '${name}' must match folder name`);
  } else if (!KEBAB_RE.test(name)) {
    fail(`Skill ${folder}: name must be kebab-case`);
  }

  if (!description) {
    fail(`Skill ${folder}: missing 'description' in frontmatter`);
  } else {
    if (description.length > DESCRIPTION_MAX_CHARS) {
      fail(`Skill ${folder}: description exceeds ${DESCRIPTION_MAX_CHARS} chars`);
    }
    if (/[<>]/.test(description)) {
      fail(`Skill ${folder}: description must not contain angle brackets`);
    }
    if (!/do not use/i.test(description)) {
      fail(`Skill ${folder}: description should include negative triggers (Do NOT use for...)`);
    }
  }

  const requiredSections = ["## Instructions", "## Examples", "## Troubleshooting"];
  for (const section of requiredSections) {
    if (!parsed.body.includes(section)) {
      fail(`Skill ${folder}: missing '${section}' section`);
    }
  }

  const refGuide = join(skillsDir, folder, "references", "area-guide.md");
  if (!existsSync(refGuide)) {
    fail(`Skill ${folder}: missing references/area-guide.md`);
  }

  pass(`Skill valid: ${folder}`);
}

// --- Authoring docs ---
for (const doc of ["docs/AGENT_WORKFLOW.md", "docs/SKILL_AUTHORING.md"]) {
  if (!existsSync(join(ROOT, doc))) {
    fail(`${doc} missing`);
  } else {
    pass(`${doc} exists`);
  }
}

if (failed) {
  console.error("\nAgent doc validation failed.");
  process.exit(1);
}

console.log("\nAgent doc validation passed.");
process.exit(0);
