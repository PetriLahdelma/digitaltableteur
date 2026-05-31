import type { SiteTreeNode } from "@dt/SiteTree";

import { getVisiblePosts } from "@/app/blog/postMetadata";
import { getAuthors } from "@/nextjs-app/shared/data/authors";
import { sortedProjects } from "@/nextjs-app/shared/data/projects";
import { getPseoCatalog, getPseoLeafPages } from "@/lib/pseo/catalog";

export type SiteStructureLabels = {
  sectionMain: string;
  sectionWork: string;
  sectionBlog: string;
  sectionAuthors: string;
  sectionGuides: string;
  sectionServices: string;
  sectionStacks: string;
  sectionAudiences: string;
  sectionTopics: string;
  sectionLegal: string;
  home: string;
  about: string;
  contact: string;
  pricing: string;
  blog: string;
  colophon: string;
  privacyPolicy: string;
  imprint: string;
  aiUse: string;
  accessibility: string;
  guides: string;
  rssFeed: string;
  xmlSitemap: string;
};

/** Build the human-readable site map tree aligned with app/sitemap.ts routes. */
export function buildSiteTree(labels: SiteStructureLabels): SiteTreeNode[] {
  const posts = getVisiblePosts();
  const authors = getAuthors();
  const pseoCatalog = getPseoCatalog();
  const pseoLeafPages = getPseoLeafPages();

  const workChildren: SiteTreeNode[] = sortedProjects.map((project) => ({
    id: `work-${project.id}`,
    label: project.title,
    href: `/work/${project.slug}`,
  }));

  const blogChildren: SiteTreeNode[] = [
    ...posts.map((post) => ({
      id: `blog-${post.slug}`,
      label: post.title,
      href: `/blog/${post.slug}`,
    })),
    {
      id: "blog-authors",
      label: labels.sectionAuthors,
      defaultExpanded: false,
      children: authors.map((author) => ({
        id: `author-${author.slug}`,
        label: author.name,
        href: `/blog/authors/${author.slug}`,
      })),
    },
    {
      id: "blog-rss",
      label: labels.rssFeed,
      href: "/blog/feed.xml",
      external: true,
    },
  ];

  const pseoChildren: SiteTreeNode[] = [
    {
      id: "pseo-services",
      label: labels.sectionServices,
      defaultExpanded: false,
      children: pseoCatalog.services.map((service) => ({
        id: `pseo-service-${service.slug}`,
        label: service.name,
        href: `/pseo/services/${service.slug}`,
      })),
    },
    {
      id: "pseo-stacks",
      label: labels.sectionStacks,
      defaultExpanded: false,
      children: pseoCatalog.stacks.map((stack) => ({
        id: `pseo-stack-${stack.slug}`,
        label: stack.name,
        href: `/pseo/stacks/${stack.slug}`,
      })),
    },
    {
      id: "pseo-audiences",
      label: labels.sectionAudiences,
      defaultExpanded: false,
      children: pseoCatalog.audiences.map((audience) => ({
        id: `pseo-audience-${audience.slug}`,
        label: audience.name,
        href: `/pseo/audiences/${audience.slug}`,
      })),
    },
    {
      id: "pseo-topics",
      label: labels.sectionTopics,
      defaultExpanded: false,
      children: pseoLeafPages.map((page) => ({
        id: `pseo-leaf-${page.slug}`,
        label: page.title,
        href: `/pseo/${page.slug}`,
      })),
    },
  ];

  return [
    {
      id: "main",
      label: labels.sectionMain,
      defaultExpanded: true,
      children: [
        { id: "home", label: labels.home, href: "/" },
        { id: "about", label: labels.about, href: "/about" },
        { id: "pricing", label: labels.pricing, href: "/pricing" },
        { id: "contact", label: labels.contact, href: "/contact" },
      ],
    },
    {
      id: "work",
      label: labels.sectionWork,
      href: "/work",
      defaultExpanded: true,
      children: workChildren,
    },
    {
      id: "blog",
      label: labels.sectionBlog,
      href: "/blog",
      defaultExpanded: true,
      children: blogChildren,
    },
    {
      id: "guides",
      label: labels.sectionGuides,
      href: "/pseo",
      defaultExpanded: false,
      children: pseoChildren,
    },
    {
      id: "legal",
      label: labels.sectionLegal,
      defaultExpanded: false,
      children: [
        { id: "privacy", label: labels.privacyPolicy, href: "/privacy-policy" },
        { id: "imprint", label: labels.imprint, href: "/imprint" },
        { id: "ai-use", label: labels.aiUse, href: "/ai-use" },
        {
          id: "accessibility",
          label: labels.accessibility,
          href: "/accessibility",
        },
        { id: "colophon", label: labels.colophon, href: "/colophon" },
        {
          id: "sitemap-xml",
          label: labels.xmlSitemap,
          href: "/sitemap.xml",
          external: true,
        },
      ],
    },
  ];
}
