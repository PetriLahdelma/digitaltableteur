import { NextResponse } from "next/server";

import { buildRobotsTxtBody } from "@/app/lib/agent-discovery";

export const revalidate = 86400;

export function GET() {
  return new NextResponse(buildRobotsTxtBody(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
