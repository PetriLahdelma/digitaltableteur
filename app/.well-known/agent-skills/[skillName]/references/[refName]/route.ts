import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

const ALLOWED_SKILLS = /^dt-[a-z0-9-]+$/;
const ALLOWED_REF = /^[a-z0-9-]+\.md$/;

export async function GET(
  _request: Request,
  context: { params: Promise<{ skillName: string; refName: string }> },
) {
  const { skillName, refName } = await context.params;

  if (!ALLOWED_SKILLS.test(skillName) || !ALLOWED_REF.test(refName)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const refPath = path.join(
    process.cwd(),
    ".claude/skills",
    skillName,
    "references",
    refName,
  );

  const referencesRoot = path.join(
    process.cwd(),
    ".claude/skills",
    skillName,
    "references",
  );

  if (!refPath.startsWith(referencesRoot) || !existsSync(refPath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = readFileSync(refPath, "utf8");

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
