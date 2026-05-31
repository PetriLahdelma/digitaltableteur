import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { markdownNegotiationHeader } from "@/app/lib/agent-discovery";
import { PREVIEW_DRAFTS_COOKIE } from "@/lib/blog/postVisibility";

const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function handleBlogDraftPreview(request: NextRequest) {
  const preview = request.nextUrl.searchParams.get("preview");
  if (preview !== "drafts" && preview !== "off") {
    return null;
  }

  const url = request.nextUrl.clone();
  url.searchParams.delete("preview");
  const response = NextResponse.redirect(url);

  if (preview === "drafts") {
    response.cookies.set(PREVIEW_DRAFTS_COOKIE, "1", {
      path: "/",
      maxAge: PREVIEW_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  } else {
    response.cookies.delete(PREVIEW_DRAFTS_COOKIE);
  }

  return response;
}

/**
 * Markdown content negotiation for AI agents (Cloudflare Agent Readiness / llmstxt.org).
 * Homepage requests with Accept: text/markdown receive llms.txt content.
 */
export function proxy(request: NextRequest) {
  const draftPreview = handleBlogDraftPreview(request);
  if (draftPreview) return draftPreview;

  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const accept = request.headers.get("accept") ?? "";
  if (!accept.includes("text/markdown")) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = "/llms.txt";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(markdownNegotiationHeader, "1");

  const response = NextResponse.rewrite(rewriteUrl, {
    request: { headers: requestHeaders },
  });
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = {
  matcher: ["/", "/blog", "/blog/:path*"],
};
