import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  agentDiscoveryBaseUrl,
  getAgentDiscoveryLinkHeader,
  markdownNegotiationHeader,
} from "@/app/lib/agent-discovery";
import { INTAKE_RESPONSE_HEADERS, createNonce, intakeCsp, isIntakePath } from "@/app/lib/intake/csp";
import { PREVIEW_DRAFTS_COOKIE } from "@/lib/blog/postVisibility";
import { isRoutableProject, projects } from "@/nextjs-app/shared/data/projects";

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

// Offer pages, blog posts and case studies each have a Markdown version at
// /<section>/<slug>/markdown. Agents reach it by adding .md to the page URL
// or, for offer pages and posts, with Accept: text/markdown. Case-study
// Markdown is a summary, so a negotiated request keeps the full HTML page.
const MARKDOWN_PAGE = /^\/(engagements|blog|work)\/([a-z0-9-]+)(\.md)?\/?$/;

// Standalone case studies without a project record have no Markdown summary.
const WORK_MARKDOWN = new Set(
  projects.filter((project) => isRoutableProject(project)).map((project) => project.slug),
);

/** q-value of a media type in an Accept header (0 when absent). */
function acceptQuality(accept: string, type: string): number {
  let best = 0;
  for (const part of accept.split(",")) {
    const [media, ...params] = part.trim().toLowerCase().split(";");
    if (media.trim() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const value = q ? Number.parseFloat(q.slice(2)) : 1;
    if (Number.isFinite(value)) best = Math.max(best, value);
  }
  return best;
}

/** True when the client prefers Markdown over HTML. */
export function prefersMarkdown(accept: string): boolean {
  const markdown = acceptQuality(accept, "text/markdown");
  return markdown > 0 && markdown >= acceptQuality(accept, "text/html");
}

/**
 * Intake pages get their own policy: a per-request nonce, no third-party
 * hosts, never cached (docs/intake/README.md, STRIDE I2/I5/I6). Next reads
 * the nonce from the request's CSP header and stamps it on its scripts,
 * which is why the header goes on the request as well as the response.
 */
function handleIntake(request: NextRequest) {
  const csp = intakeCsp(createNonce(), {
    dev: process.env.NODE_ENV === "development",
    https: process.env.VERCEL === "1" || process.env.FORCE_HTTPS_CSP === "1",
  });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  for (const [key, value] of Object.entries(INTAKE_RESPONSE_HEADERS)) response.headers.set(key, value);
  return response;
}

/**
 * Markdown content negotiation for AI agents (Cloudflare Agent Readiness / llmstxt.org).
 * Homepage requests with Accept: text/markdown receive llms.txt content;
 * offer pages, blog posts and case studies receive their Markdown version.
 */
export function proxy(request: NextRequest) {
  if (isIntakePath(request.nextUrl.pathname)) return handleIntake(request);

  const draftPreview = handleBlogDraftPreview(request);
  if (draftPreview) return draftPreview;

  const accept = request.headers.get("accept") ?? "";
  const page = request.nextUrl.pathname.match(MARKDOWN_PAGE);

  if (page) {
    const [, section, slug, suffix] = page;
    const available = section !== "work" || WORK_MARKDOWN.has(slug);
    const wantsMarkdown = Boolean(suffix) || (section !== "work" && prefersMarkdown(accept));
    if (available && wantsMarkdown) {
      const markdownUrl = request.nextUrl.clone();
      markdownUrl.pathname = `/${section}/${slug}/markdown`;
      const response = NextResponse.rewrite(markdownUrl);
      response.headers.set("Vary", "Accept");
      // The .md URL is a second address for the page; point search engines
      // at the HTML original.
      response.headers.set(
        "Link",
        `<${agentDiscoveryBaseUrl}/${section}/${slug}>; rel="canonical", ${getAgentDiscoveryLinkHeader()}`,
      );
      return response;
    }
    const response = NextResponse.next();
    if (section !== "work") response.headers.set("Vary", "Accept");
    return response;
  }

  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  if (!prefersMarkdown(accept)) {
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
  matcher: ["/", "/blog", "/blog/:path*", "/engagements/:slug", "/work/:slug", "/intake", "/intake/:path*"],
};
