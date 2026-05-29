import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Markdown content negotiation for AI agents (Cloudflare Agent Readiness / llmstxt.org).
 * Homepage requests with Accept: text/markdown receive llms.txt content.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/markdown")) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = "/llms.txt";

  const response = NextResponse.rewrite(rewriteUrl);
  response.headers.set("Content-Type", "text/markdown; charset=utf-8");
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = {
  matcher: "/",
};
