import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { agentDiscoveryBaseUrl } from "@/app/lib/agent-discovery";

export const dynamic = "force-static";

const SKILLS_SCHEMA =
  "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

function parseDescription(content: string): string {
  const match = content.match(
    /^description:\s*>-\s*\n([\s\S]*?)(?=\n\S|\n---)/m,
  );
  if (match) {
    return match[1]
      .split("\n")
      .map((line) => line.trim())
      .join(" ")
      .trim();
  }
  const single = content.match(/^description:\s*(.+)$/m);
  return single?.[1]?.trim() ?? "Project agent skill";
}

function buildSkillsIndex() {
  const skillsDir = path.join(process.cwd(), ".claude/skills");
  const baseUrl = agentDiscoveryBaseUrl;
  const skills: Array<{
    name: string;
    type: string;
    description: string;
    url: string;
    digest: string;
  }> = [];

  if (!existsSync(skillsDir)) {
    return skills;
  }

  for (const name of readdirSync(skillsDir)) {
    if (!name.startsWith("dt-")) continue;
    const skillPath = path.join(skillsDir, name, "SKILL.md");
    if (!existsSync(skillPath)) continue;

    const content = readFileSync(skillPath, "utf8");
    const digest = `sha256:${createHash("sha256").update(content).digest("hex")}`;

    skills.push({
      name,
      type: "skill-md",
      description: parseDescription(content),
      url: `${baseUrl}/.well-known/agent-skills/${name}`,
      digest,
    });
  }

  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

export async function GET() {
  return NextResponse.json(
    {
      $schema: SKILLS_SCHEMA,
      skills: buildSkillsIndex(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
