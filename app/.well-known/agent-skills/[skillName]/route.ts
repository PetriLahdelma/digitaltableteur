import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

const ALLOWED_SKILLS = /^dt-[a-z0-9-]+$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ skillName: string }> },
) {
  const { skillName } = await context.params;

  if (!ALLOWED_SKILLS.test(skillName)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const skillPath = path.join(
    process.cwd(),
    ".claude/skills",
    skillName,
    "SKILL.md",
  );

  if (!existsSync(skillPath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = readFileSync(skillPath, "utf8");

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
