import type { SiteTreeNode } from "./SiteTree";

/** Representative site tree for Storybook and the future /sitemap page. */
export const sampleSiteTree: SiteTreeNode[] = [
  {
    id: "main",
    label: "Main",
    defaultExpanded: true,
    children: [
      { id: "home", label: "Home", href: "/" },
      { id: "about", label: "About", href: "/about" },
      { id: "pricing", label: "Pricing", href: "/pricing" },
      { id: "contact", label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "work",
    label: "Work",
    href: "/work",
    indexLabel: "Work overview",
    defaultExpanded: true,
    children: [
      {
        id: "work-helsinki",
        label: "Helsinki Design System",
        href: "/work/helsinki-design-system",
      },
      {
        id: "work-sap",
        label: "SAP Build Apps",
        href: "/work/sap-build-apps",
      },
      {
        id: "work-vertaaux",
        label: "VertaaUX",
        href: "/work/vertaaux",
      },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    href: "/blog",
    indexLabel: "Blog home",
    defaultExpanded: true,
    children: [
      {
        id: "blog-post-1",
        label: "Digital craftsmanship",
        href: "/blog/digital-craftsmanship",
      },
      {
        id: "blog-authors",
        label: "Authors",
        defaultExpanded: false,
        children: [
          {
            id: "author-petri",
            label: "Petri Lahdelma",
            href: "/blog/authors/petri-lahdelma",
          },
        ],
      },
      {
        id: "blog-feed",
        label: "RSS feed",
        href: "/blog/feed.xml",
        external: true,
      },
    ],
  },
  {
    id: "legal",
    label: "Legal & info",
    defaultExpanded: false,
    children: [
      { id: "privacy", label: "Privacy policy", href: "/privacy-policy" },
      { id: "imprint", label: "Imprint", href: "/imprint" },
      { id: "accessibility", label: "Accessibility", href: "/accessibility" },
      { id: "colophon", label: "Colophon", href: "/colophon" },
      {
        id: "sitemap-xml",
        label: "XML sitemap",
        href: "/sitemap.xml",
        external: true,
      },
    ],
  },
];
