import { NextResponse } from "next/server";

import { getVisiblePosts } from "../blog/postMetadata";
import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://digitaltableteur.com";

const staticPages: Array<{ path: string; title: string; meta?: string }> = [
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

export const revalidate = 600;

export async function GET() {
  const pseoCatalog = getPseoCatalog();
  const pseoLeafPages = getPseoLeafPages();
  const posts = getVisiblePosts();

  const keyPages = [
    ...staticPages,
    { path: "/pseo", title: "Programmatic Guides" },
    ...pseoCatalog.services.map((item) => ({
      path: `/pseo/services/${item.slug}`,
      title: `PSEO Service: ${item.name}`,
      meta: item.shortDescription,
    })),
    ...pseoCatalog.stacks.map((item) => ({
      path: `/pseo/stacks/${item.slug}`,
      title: `PSEO Stack: ${item.name}`,
      meta: item.shortDescription,
    })),
    ...pseoCatalog.audiences.map((item) => ({
      path: `/pseo/audiences/${item.slug}`,
      title: `PSEO Audience: ${item.name}`,
      meta: item.shortDescription,
    })),
    ...pseoLeafPages.map((page) => ({
      path: `/pseo/${page.slug}`,
      title: page.title,
      meta: page.description,
    })),
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
