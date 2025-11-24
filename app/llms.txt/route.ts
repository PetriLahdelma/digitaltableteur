import { NextResponse } from "next/server";

import { posts } from "../blog/postMetadata";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://digitaltableteur.com";

const staticPages = [
  { path: "/", title: "Home" },
  { path: "/about", title: "About" },
  { path: "/ai-use", title: "AI Usage" },
  { path: "/contact", title: "Contact" },
  { path: "/work", title: "Work" },
  { path: "/cookie-policy", title: "Cookie Policy" },
  { path: "/cookie-policy-full-en", title: "Cookie Policy EN" },
  { path: "/cookie-policy-full-fi", title: "Cookie Policy FI" },
  { path: "/cookie-policy-full-sv", title: "Cookie Policy SV" },
  { path: "/blog", title: "Blog" },
  { path: "/work/new-things-co", title: "Work: New Things Co" },
  { path: "/work/illustrations", title: "Work: Illustrations" },
  { path: "/work/garage-junction", title: "Work: Garage Junction" },
];

export const dynamic = "force-static";

export async function GET() {
  const keyPages = [
    ...staticPages,
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      title: post.title,
      meta: post.excerpt,
    })),
  ];

  let body = "# Digitaltableteur\n\n";
  body +=
    "Selected pages and blog posts for LLMs. Primary host: Next.js on Vercel. GitHub Pages is a fallback only.\n\n";
  body += "## Key Pages\n";

  for (const page of keyPages) {
    const url = `${baseUrl}${page.path}`;
    body += `- ${page.title}: ${url}`;
    if (page.meta) body += ` — ${page.meta}`;
    body += "\n";
  }

  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
